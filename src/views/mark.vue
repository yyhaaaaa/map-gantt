<template>
  <div class="map">
    <div id="map-container"></div>
    <div class="districtSelector">
      <el-select v-model="addressForm.province" placeholder="请选择" style="width:120px" @change="bindProvinceChange">
        <el-option v-for="item in provinceList" :label="item.name" :value="item.adcode" :key="item.name + item.adcode"></el-option>
      </el-select>
      <el-select v-model="addressForm.city" placeholder="请选择" style="width:120px" @change="bindCityChange">
        <el-option v-for="item in cityList" :label="item.name" :value="item.adcode" :key="item.name + item.adcode"></el-option>
      </el-select>
      <el-select v-model="addressForm.district" placeholder="请选择" style="width:120px" @change="bindDistrictChange">
        <el-option v-for="item in districtList" :label="item.name" :value="item.adcode" :key="item.name + item.adcode"></el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
import { lazyAMapApiLoaderInstance } from 'vue-amap'

export default {
  mounted() {
    let _this = this
    let info = document.getElementsByClassName('info-window__wrap')
    console.log(info, info.innerHTML);
    lazyAMapApiLoaderInstance.load().then(() => {
      this.initMap()
      // this.addLabel(this.createLabel())
      this.getDistrictInfo('country', '1', '中国', result => {
        _this.provinceList = result.districtList[0].districtList
        result.districtList[0].districtList.forEach(item => {
          _this.createCircleMarker(item, 100, true)
        })
      })
      this.map.setFitView()
    })
  },
  data() {
    return {
      workOrderIcon: {
        // 图标类型，现阶段只支持 image 类型
        type: 'image',
        // 图片 url
        image: require('@/assets/location.svg'),
        // 图片尺寸x
        size: [30, 30],
        // 图片相对 position 的锚点，默认为 bottom-center
        anchor: 'center',
      },
      textStyle: {
        fontSize: 12,
        fontWeight: 'normal',
        fillColor: '#323233',
        strokeColor: '#fff',
        strokeWidth: 2,
        fold: true,
        padding: '2, 5',
      },
      provinceList: [], // 省列表
      cityList: [], // 市列表
      districtList: [], // 区列表
      addressForm: {
        province: '',
        city: '',
        district: ''
      }, // 当前选择的省市区
      markerList: [], // 地图上所有的圆标记
      workOrderLabelList: [], // 地图上所有的工单图标
      staffLabelList: [], // 地图上所有的员工图标
      selectedLabelLayer: '', // 当前选中的标记
      selectedIcon: {
        type: 'image',
        size: [80,36],
        image: require('@/assets/定位圈.svg'),
        anchor: 'center',
        offset: [0, 18]
      }
    }
  },
  methods: {
    initMap() {
      this.map = new AMap.Map('map-container', {
        resizeEnable: true,
        center: [116.39, 39.90],
        zoom: 5
      })
    },
    /**
     * 选择省。
     *
     * @param {object} adcode 当前选中的省的adcode
     */
    bindProvinceChange(adcode) {
      let _this = this
      console.log(adcode, 'province')
      this.getDistrictInfo('province', '1', adcode, res => {
        _this.cityList = res.districtList[0].districtList
        _this.map.setCenter(res.districtList[0].center)
        _this.map.setZoom(7)
        _this.clearAllMarker() // 清除原有的标记
        // 创建新标记
        res.districtList[0].districtList.forEach(item => {
          this.createCircleMarker(item, 10)
        })
      })
      this.addressForm.city = ''
      this.addressForm.district = ''
    },
    /**
     * 选择市。
     *
     * @param {object} adcode 当前选中的市的adcode
     */
    bindCityChange(adcode) {
      let _this = this
      this.getDistrictInfo('city', '1', adcode, res => {
        _this.districtList = res.districtList[0].districtList
        _this.map.setCenter(res.districtList[0].center)
        _this.map.setZoom(12)
        _this.clearAllMarker() // 清除原有的标记
        // 创建新标记
        res.districtList[0].districtList.forEach(item => {
          this.createCircleMarker(item, 2)
        })
      })
      this.addressForm.district = ''
    },
    /**
     * 选择区。
     *
     * @param {object} adcode 当前选中的区的adcode
     */
    bindDistrictChange(adcode) {
      let _this = this
      this.getDistrictInfo('district', '1', adcode, res => {
        _this.map.setCenter(res.districtList[0].center)
        _this.map.setZoom(14)
        _this.clearAllMarker() // 清除原有的标记
        // 创建员工及工单图标
        this.addLabel(this.createLabel(res.districtList[0].center))
        // res.districtList[0].districtList.forEach(item => {
        //   this.addLabel(this.createLabel(item.center))
        // })
      })
    },
    /**
     * 查询行政区信息，并执行相应操作
     *
     * @param {string} level 行政区级别
     * @param {number}  subdistrict 显示下级行政区级数（行政区级别包括：国家、省/直辖市、市、区/县4个级别），商圈为区/县下一 级，可选值：0、1、2、3
     * @param {string} keyword 根据关键字查询行政区或商圈信息 关键字支持：行政区名、citycode、adcode、商圈名
     * @param {callback} callback 拿到信息后要执行的操作
     */
    getDistrictInfo(level, subdistrict, keyword, callback) {
      var districtSearch = new AMap.DistrictSearch({
          // 关键字对应的行政区级别，country表示国家
          level,
          //  显示下级行政区级数，1表示返回下一级行政区
          subdistrict
        })
        // 搜索所有省/直辖市信息
        districtSearch.search(keyword, function(status, result) {
          // 查询成功时，result即为对应的行政区信息
          console.log(status, result, '查询行政区');
          if (status === 'complete') {
            callback(result)
          }
        })
    },
    /**
     * 创建圆标记
     *
     * @param {object} data 区域信息（包含区域名、中心点、位置码、行政区级别）
     * @param {number} num 当前区域的工单数量
     */
    createCircleMarker(data, num, islimit = false) {
      // 圆标记的结构
      let div = document.createElement('div');
      div.className = 'circle';
      div.style.backgroundColor = '#20a0ff'
      // let name = islimit ? data.name.substr(0,2) : data.name
      var htmlData='<div>'+ data.name +'</div><div>'+num+'</div>';
      div.innerHTML = htmlData;
      
      // 创建圆标记
      var marker = new AMap.Marker({
          content: div,
          title:data.name,
          position: data.center,
          offset: new AMap.Pixel(-24, 5),
          extData: { // 绑定事件时要用到的自定义参数
            adcode: data.adcode,
            name: data.name,
            level: data.level
          }
      })
      // 存储该标记，方便后面统一管理
      this.markerList.push(marker)
      // 将标志绘制到地图上
      marker.setMap(this.map)
      marker.on('click', e => {
        // console.log(e.target.getOptions())
        let extData = e.target.getOptions().extData
        switch (extData.level) {
          case 'province':
            this.bindProvinceChange(extData.adcode)
            this.addressForm.province = extData.name
            break;
          case 'city':
            this.bindCityChange(extData.adcode)
            this.addressForm.city = extData.name
            break;
          case 'street':
          case 'district':
            this.bindDistrictChange(extData.adcode)
            this.addressForm.district = extData.name
            break;
          default:
            break;
        }
      })
    },
    addSelectedMarker(position) {
      
      let selectedMarker = new AMap.LabelMarker({
        name: 'selected',
        position,
        zooms: [2, 20],
        opacity: 1,
        zIndex: 15,
        icon: this.selectedIcon,
      })
      // 创建一个 LabelsLayer 实例来承载 LabelMarker，[LabelsLayer 文档](https://lbs.amap.com/api/jsapi-v2/documentation#labelslayer)
      this.selectedLabelLayer = new AMap.LabelsLayer({
          collision: true,
          zIndex: 99,
          zooms: [3, 20] // 图层展示的范围
      });
      // 将 LabelMarker 实例添加到 LabelsLayer 上
      this.selectedLabelLayer.add(selectedMarker)
      // this.selectedLabelLayer = selectedLabelLayer
      // 将 LabelsLayer 添加到地图上
      this.map.add(this.selectedLabelLayer)
    },
    clearSelectedMarker() {
      this.map.remove(this.selectedLabelLayer)
      this.selectedLabelLayer = ''
    },
    clearCircleMarker() {
      this.map.remove(this.markerList)
    },
    clearLabelMarker() {
      this.map.remove(this.workOrderLabelList)
    },
    clearAllMarker() {
      this.clearSelectedMarker()
      this.clearCircleMarker()
      this.clearLabelMarker()
    },
    createLabel(position) {
      let that = this
      let labelsData = [
        {
          name: '自提点2',
          position,
          zooms: [2, 20],
          opacity: 1,
          zIndex: 16,
          icon: that.workOrderIcon,
          text: {
              content: '工单名称',
              direction: 'bottom',
              offset: [0, 0],
              style: this.textStyle
          }
        }
      ]
      // 创建标记集
      let labelMarkers = []
      let labelMarker = new AMap.LabelMarker(labelsData[0])
      labelMarker.on('click', () => {
        that.labelClick(position)
      })
      labelMarkers.push(labelMarker)
      
      return labelMarkers
    },
    addLabel(markers) {
      // 创建一个标记图层用于承载标记
      var labelsLayer = new AMap.LabelsLayer({
          collision: true,
          zIndex: 100,
          zooms: [3, 20] // 图层展示的范围
      })
      // 将标点集挂载到图层上
      labelsLayer.add(markers)
      this.workOrderLabelList = labelsLayer
      // 将图层挂载到地图上
      this.map.add(labelsLayer)
    },
    labelClick(position) {
      this.clearSelectedMarker()
      this.addSelectedMarker(position)
      let infoWindowContent = '<div className="workOrder-infowindow input-card">' +
          '<label class="workOrder-infowindow__title">附近员工</label>' +
          '<div class="table" style="margin: 10px 0 10px 8px;">' +
            '<div class="table-head">' +
              '<span>员工</span><span>未完成工单</span><span>距离</span><span>操作</span>' +
            '</div>' +
            '<div class="table-content">' +
              '<span class="table-staff" style="">周杰伦</span><span>1</span><span>500m</span><span>指派</span>' +
            '</div>' +
            '<div class="table-content">' +
              '<span class="table-staff" style="">周杰伦</span><span>1</span><span>500m</span><span>指派</span>' +
            '</div>' +
            '<div class="table-content">' +
              '<span class="table-staff" style="">周杰伦</span><span>1</span><span>500m</span><span>指派</span>' +
            '</div>' +
            '<div class="table-content">' +
              '<span class="table-staff" style="">周杰伦</span><span>1</span><span>500m</span><span>指派</span>' +
            '</div>' +
          '</div>' +
          // 为 infowindow 添加自定义事件
          '<input id="lnglat2container" type="button" class="btn" value="获取该位置经纬度" onclick="getLngLat()"/>' +
        '</div>'
      
      let infoWindow = new AMap.InfoWindow({
        position: position,
        offset: new AMap.Pixel(0, -30),
        content: infoWindowContent
      })
      infoWindow.open(this.map)
    }
  }
}
</script>

<style lang="scss">
.circle {
  border-radius: 50%;
  border: solid 1px silver;
  width: 50px;
  height: 50px;
  padding: 3px;
  text-align: center;
  line-height: 12px;
  max-width: 50px;
  color:#fff;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.districtSelector {
  display: flex;
  align-items: center;
  height: 44px;
  width: 370px;
  background-color: #fff;
  border-radius: 4px;
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 1000;
  box-sizing: border-box;
  .el-select{
    display: inline-block;
    input{
      font-size: 14px;
      border: none;
      background: none;
      text-align: center;
      font-weight: bold;
    }
    .el-input__suffix{
      i{
        margin-left: 0.06rem;
        font-weight: bold;
      }
    }
    /* WebKit browsers */
    ::-webkit-input-placeholder {
      font-weight: bold;
    }
  }

}
.map {
  display: flex;
  justify-content: center;
  position: relative;
}
#map-container {
  height: 600px;
  width: 100%;
}
.workOrder-infowindow {
  width: 400px;
  height: 250px;
  &__title {
    color: #323233;
    font-size: 14px;
    font-family: PingFangSC-Regular;
    margin-bottom: 10px;
    font-weight: 500;
  }
}
.table {
  .table-head {
    background-color: #F7F8FA;
    width: 400px;
    height: 36px;
    display: flex;
    border-bottom: 1px solid #f2f3f5;
    span {
      height: 36px;
      width: 100px;
      color: #969799;
      font-size: 12px;
      padding: 12px;
    }
  }
  .table-content {
    width: 400px;
    height: 36px;
    display: flex;
    border-bottom: 1px solid #f2f3f5;
    span {
      height: 36px;
      width: 100px;
      color: #969799;
      font-size: 12px;
      font-weight: 700;
      padding: 12px;
    }
    .table-staff {
      color: #248DF5;
    }
  }
}
</style>