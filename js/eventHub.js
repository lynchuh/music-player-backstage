window.eventHub = {
  events: {

  }, // hash
  emit(eventName, data){ //发布
    for(let key in this.events){
      if(key === eventName){
        let fnList = this.events[key]
        fnList.map((fn)=>{
          fn.call(undefined, data)
        })
      }
    }
  },
  on:function(eventName, fn){ //订阅 
    if(this.events[eventName] === undefined){
      this.events[eventName] = []
    }
    this.events[eventName].push(fn)
    
  },
  test:function(){
    console.log('我进入订阅发布中心啦')
    console.log(this.events)
  }
}
