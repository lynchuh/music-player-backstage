{
  let view = {
    el: '#songListContainer',
    template: `<h1 class="active">新建歌单</h1>
      <ul class="songList">
      </ul>
    `,
    init(data){
      this.render(data)
    },
    render(data) {
      let $el = $(this.el)
      $el.html(this.template)
      let songs = data.songs
      let liList = songs.map((song) => {
        let content=`${song.name}-${song.singer}`
        return $('<li></li>').text(content).attr('data-song-id',song.id)
      })
      liList.map((domLi) => {
        $el.find('ul.songList').append(domLi)
      })

    },
    reset() {
      this.render(this.model.data)
    },
    activeItem(selector) {
      let $el = $(this.el)
      $el.find('.active').removeClass('active')
      $el.find(selector).addClass('active')
    }
  }
  let model = {
    data: {
      songs: []
    },
    find() {
      var query = new AV.Query('Song')
      return query.find().then((songs)=>{
        this.data.songs=songs.map((song)=>{
          return {id:song.id,...song.attributes}
        })
        return songs
      })
    }
  }
  let controller = {
    init(view, model) {
      this.view = view
      this.model = model
      this.model.find()
      this.view.init(this.model.data)
      this.bindEventHub()
      this.getAllSongs()
      this.bindEvent()
    },
    getAllSongs(){
      this.model.find().then(()=>{
        this.view.render(this.model.data)
      })
    },
    bindEvent(){
      $(this.view.el).on('click','li',(e)=>{
        let $li=$(e.currentTarget)
        this.view.activeItem($li)
        let songId=$li[0].getAttribute('data-song-id')
        let data
        let songs=this.model.data.songs
        for(let i=0;i<songs.length;i++){
          if(songs[i].id===songId){
            data=JSON.parse(JSON.stringify(songs[i]))
          }
        }
        window.eventHub.emit('selectLi',data)
      })
      $(this.view.el).on('click','h1',(e)=>{
        window.eventHub.emit('uploadNew')
        this.view.activeItem('h1')

      })
    },
    bindEventHub(){

      window.eventHub.on('create', (data) => {
        this.model.data.songs.push(data)
        this.view.render(this.model.data)
        this.view.activeItem(`li[data-song-id=${data.id}]`)
        window.eventHub.emit('selectLi',data)
      })
      window.eventHub.on('update',(data)=>{
        let modelSong = this.model.data.songs
        for(let i=0;i<modelSong.length;i++){
          if(modelSong[i].id===data.id){
            Object.assign(modelSong[i],data)
            break
          }
        }
        this.view.render(this.model.data)
        window.eventHub.emit('selectLi',data)
        this.view.activeItem(`li[data-song-id=${data.id}]`)
      })
    }
  }
  controller.init(view, model)
}
