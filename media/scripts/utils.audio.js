(function () {
  window.utils = window.utils || {};

  window.utils.audio = {
    fetchArrayBuffer: function (url) {
      var self = this;
      return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        // Decode asynchronously
        request.onload = function() {
          if (this.status == 200) {
            resolve(request.response);
          } else {
            reject(this.statusText);
          }
        }
        request.send();
      });
    }
  }
})();
