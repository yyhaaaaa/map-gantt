<template>
  <div class="map">
    <div id="map-container"></div>
  </div>
</template>

<script>
import { lazyAMapApiLoaderInstance } from 'vue-amap'

export default {
  mounted() {
    lazyAMapApiLoaderInstance.load().then(() => {
      this.initMap()
      this.addMarker()
    })
  },
  data() {
    return {

    }
  },
  methods: {
    initMap() {
      this.map = new AMap.Map('map-container', {
        resizeEnable: true,
        center: [116.397428, 39.90923],
        zoom: 13
      })
    },
    addMarker() {
      var markIcon = new AMap.Icon({
        image: require('@/assets/location.svg'),
        // 图标所用图片大小
        imageSize: new AMap.Size(32, 32),
        // 图标取图偏移量
        imageOffset: new AMap.Pixel(-6, 0)
      })
      var marker = new AMap.Marker({
          position: [116.406315, 39.908775],
          icon: markIcon
      })
      marker.on('click', () => {
        alert('123')
      })
      marker.setMap(this.map)
    },
    markLabel() {
      var marker = new AMap.Marker({
          position: new AMap.LngLat(116.406315, 39.908775),
          icon: require('@/assets/location.svg'),
          offset: new AMap.Pixel(-13, -30),
          label: {
            content: '工单1',
            direction: 'bottom'
          }
      });
      this.map.add(marker);

    }
  }
}
</script>

<style lang="scss">
.map {
  display: flex;
  justify-content: center;
}
#map-container {
  height: 800px;
  width: 1200px;
}
</style>