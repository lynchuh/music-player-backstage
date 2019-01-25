{
  let view = {
    el: '#songForm',
    template: `
    <form action="">
      <div class="row">
        <label for=""> <span>歌名：</span>
          <input name="name" type="text" value="__name__">
        </label>
        <label for=""><span>歌手：</span>
          <input name="singer" type="text" value="__singer__">
        </label>
      </div>
      <div class="row">
        <label for=""><span>外链：</span>
          <input name="url" type="text" value="__url__">
        </label>
        <label for=""><span>封面：</span>
        <input name="cover" type="text" value="__cover__">
      </label>
      </div>
      <div class="row">
        <label><span>歌词</span>
        <textarea name="lyric">__lyric__</textarea>
        </label>
      </div>
      <div class="row">
        <button type="submit">保存</button>
      </div>
    </form>
    `,
    render(data = {}) {
      let placeholders = ['name', 'url', 'singer','cover','lyric']
      let html = this.template
      placeholders.map((string) => {
        html = html.replace(`__${string}__`, data[string] || '')
      })
      $(this.el).html(html)
      if (data.id) {
        $(this.el).prepend('<h1>编辑歌曲</h1>')
      } else {
        $(this.el).prepend('<h1>新建歌曲</h1>')
      }
    },
    reset() {
      this.render({})
    }
  }
  let model = {
    data: {
      name: '',
      singer: '',
      url: '',
      cover:'',
      lyric:'',
      id: ''
    },
    create(data) { //将form上的信息保存到leancloud，会生成一个id
      var Song = AV.Object.extend('Song');
      var songs = new Song();
      songs.set('name', data.name);
      songs.set('singer', data.singer);
      songs.set('url', data.url);
      songs.set('lyric', data.lyric);
      songs.set('cover', data.cover);
      return songs.save().then((newSong) => {
        console.log(newSong)
        let {
          id,
          attributes
        } = newSong
        this.data = {
          id,
          ...attributes
        }
      }, (error) => {
        console.error(error.message);
      });
    },
    update(data) { //将form上的信息更新到leancloud，id不变
      var song = AV.Object.createWithoutData('Song', this.data.id);
      song.set('name', data.name)
      song.set('singer', data.singer)
      song.set('url', data.url)
      song.set('lyric', data.lyric)
      song.set('cover', data.cover)
      return song.save()
        .then(() => {
          Object.assign(this.data, data)
        })

    }
  }
  let controller = {
    init(view, model) {
      this.view = view
      this.model = model
      this.view.render(this.model.data)
      this.bindEvent()
      this.bindEventHub()
    },
    bindEvent() {
      $(this.view.el).on('submit', 'form', (e) => {
        e.preventDefault()
        let need = 'name singer url lyric cover'.split(' ') //得到一个数组
        let data = []
        need.map((string) => {
          data[string] =
            $(this.view.el).find(`[name="${string}"]`).val()
        })
        if (this.model.data.id) { //id存在，即是要更新信息
          this.model.update(data).then(() => {
            window.eventHub.emit('update', this.model.data)
            window.alert("修改成功")
          })
        } else {//id 不存在，即是要增加信息
          this.model.create(data)
            .then(() => {
              this.view.reset()
              window.eventHub.emit('create', this.model.data)
              window.alert('上传成功')
            })
        }
      })
    },
    bindEventHub(){
      window.eventHub.on('uploaded', (data) => {
        Object.assign(this.model.data, data)
        this.view.render(this.model.data)
      })
      window.eventHub.on('uploadNew',(data)=>{
        this.model.data = {
              id: '',
              name: '',
              singer: '',
              url: '',
              lyric:'',
              cover:''
            }
        this.view.render(this.model.data)
      })
      window.eventHub.on('uploadCover',(data)=>{
        Object.assign(this.model.data,data)
        this.view.render(this.model.data)
      })
      window.eventHub.on('selectLi', (data) => {
        this.model.data = data
        this.view.render(this.model.data)
      })
      window.eventHub.on('selectCreate', (data) => {
        console.log(data)
        this.model.data = data
        this.view.render(this.model.data)
      })
    }
  }
  controller.init(view, model)
}
