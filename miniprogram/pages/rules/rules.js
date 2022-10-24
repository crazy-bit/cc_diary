Page({
    mixins: [require('../../mixin/common')],
    data: {
        base_quota: 10, // 初始额度
        quota_increment: 1,   // 逐年涨幅
        base_life: 1,   // 生活费初始额度
        life_decrement: 0.9, // 生活费降幅
    }
  });
  