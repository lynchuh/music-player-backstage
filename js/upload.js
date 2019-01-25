{
  let view = {
    el: '#uploadArea',
    init() {
      this.$el = $(this.el)
    }
  }
  let model = {
    data: {}
  }
  let controller = {
    init(view, model) {
      this.view = view
      this.model = model
      this.view.init()
      this.initQiniu(this.view.$el.find('#uploadSong'), this.uploadSong)
      this.initQiniu(this.view.$el.find('#uploadCover'),this.uploadCover)
    },
    initQiniu($targetElement, callback) {
      let uploader = Qiniu.uploader({
        runtimes: 'html5,flash,html4',
        browse_button: $targetElement.find('.uploadBtn')[0],
        uptoken_url: 'http://localhost:8888/uptoken',
        domain: 'http://public.lynchuh.com/',
        get_new_uptoken: false,
        container: $targetElement[0],
        max_file_size: '100mb',
        flash_swf_url: 'js/plupload/Moxie.swf',
        max_retries: 3,
        dragdrop: true,
        drop_element: $targetElement[0],
        chunk_size: '4mb',
        auto_start: true,
        init: {
          'FilesAdded': (up, files) => {
            plupload.each(files, (file) => {
              // 文件添加进队列后,处理相关的事情
            });
          },
          'BeforeUpload': (up, file) => {//上传前
            // 每个文件上传前,处理相关的事情
          },
          'UploadProgress': (up, file) => {//上传中
            window.eventHub.emit('uploading')
          },
          'FileUploaded': (up, file, info) => {
            callback && callback.call(undefined,up,info)
          },
          'Error': (up, err, errTip) => {
            //上传出错时,处理相关的事情
          },
          'UploadComplete': () => {
            //队列文件处理完毕后,处理相关的事情
          },

        }
      });
    },
    uploadSong(up,info) {
      let domain = up.getOption('domain');
      let response = JSON.parse(info.response);
      let sourceLink = domain + encodeURIComponent(response.key);
      window.eventHub.emit('uploaded', {
        response: response,
        name: response.key,
        url: sourceLink
      })
    },
    uploadCover(up,info) {
      let domain = up.getOption('domain');
      let response = JSON.parse(info.response);
      let coverLink = domain + encodeURIComponent(response.key);
      window.eventHub.emit('uploadCover', {
        cover: coverLink
      })
    }

  }
  controller.init(view, model)
}
