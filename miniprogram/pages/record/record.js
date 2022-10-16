Page({
    mixins: [require('../../mixin/common')],
    data: {
        today: (new Date()).toLocaleDateString()
    }
  });
  