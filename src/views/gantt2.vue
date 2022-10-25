<template>
  <div class="gantt">
    <div class="staff-search"></div>
    <div class="gantt-header">
      <div class="gantt-header__left">
        <el-radio v-model="radio" label="justShowLeishow">只看有时间</el-radio>
      </div>
      <div class="gantt-header__center">
        <i class="el-icon-arrow-left" @click="lastStageDate()"></i>
        <span class="current-time">{{currentTimeLabel}}</span>
        <i class="el-icon-arrow-right" @click="nextStageDate()"></i>
      </div>
      <div class="gantt-header__right">
        <div class="day" :class="{'highlight': dateType === 'day'}" @click="changeDateType('day')">天</div>
        <div class="week" :class="{'highlight': dateType === 'week'}" @click="changeDateType('week')">周</div>
        <div class="month" :class="{'highlight': dateType === 'month'}" @click="changeDateType('month')">月</div>
      </div>
    </div>
    <div class="gantt-table">
          <Gantt
            ref="easygantt"
            :sort="{
              row: '时间',
              column: '员工'
            }"
            :ganttHead="showHeadList"
            :ganttData="tableData"
            ></Gantt>
    </div>
  </div>
</template>

<script>
import moment from "moment"
import Gantt from '@/components/gantt.vue'

export default {
  components: {
    Gantt
  },
  data() {
    return {
      originData: [
        {
          staffName: '老八',
          avatar: '图标地址',
          id: 8983,
          workOrderList: [
            {
              state: 'completed',
              workOrderName: '工单名称 00:00 - 3:00',
              id: 1,
              startTime: 1666110218000,
              endTime: 1666117418000
            },
            {
              state: 'uncompleted',
              workOrderName: '00:00 - 3:00 工单名称2',
              id: 2,
              startTime: 1666110218000,
              endTime: 1666117418000
            },
            {
              state: 'uncompleted',
              workOrderName: '00:00 - 3:00 工单名称3',
              id: 3,
              startTime: 1666110218000,
              endTime: 1666117418000
            },
            {
              state: 'completed',
              workOrderName: '2:00 - 5:00 工单名称4',
              id: 4,
              startTime: 1666117418000,
              endTime: 1666124618000
            }
          ]
        },
        {
          staffName: '老六',
          avatar: '图标地址',
          id: 8982,
          workOrderList: [
            {
              state: 'completed',
              workOrderName: '00:00 - 3:00 工单名称3',
              id: 5,
              startTime: 1666110218000,
              endTime: 1666117418000
            },
            {
              state: 'uncompleted',
              workOrderName: '2:00 - 5:00 工单名称4',
              id: 6,
              startTime: 1666117418000,
              endTime: 1666124618000
            }
          ]
        },
        {
          staffName: '李白',
          id: 8981,
          workOrderList: [
            {
              state: 'uncompleted',
              workOrderName: '2:00 - 5:00 工单名称4',
              id: 7,
              startTime: 1666117418000,
              endTime: 1666124618000
            }
          ]
        }
      ],
      radio: 'justShowLeishow',
      tableData: [],
      currentTimeLabel: '2022-07-13',
      currentTime: '',
      dateType: 'day',
      test: '',
      weekLabelList: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      currentDayList: [
        '00:00', '01:00', '02:00', '03:00',
        '04:00', '05:00', '06:00', '07:00',
        '08:00', '09:00', '10:00', '11:00',
        '12:00', '13:00', '14:00', '15:00',
        '16:00', '17:00', '18:00', '19:00',
        '20:00', '21:00', '22:00', '23:00',
      ],
      currentWeekList: [
        {
          date: '',
          weekLabel: ''
        },
        {
          date: '',
          weekLabel: ''
        },
        {
          date: '',
          weekLabel: ''
        },
        {
          date: '',
          weekLabel: ''
        },
        {
          date: '',
          weekLabel: ''
        },
        {
          date: '',
          weekLabel: ''
        },
        {
          date: '',
          weekLabel: ''
        }
      ],
      currentMonthList: [],
      circleMarkerList: [
        {
          adcode: 350000, // 区域码
          num: 100 // 当前区域的工单数量
        },
        {
          adcode: 350000,
          num: 100
        },
        {
          adcode: 350000,
          num: 100
        },
      ],
      labelMarkerList: [
        {
          center: [116.39, 39.90], // 经纬度坐标
          type: 'work-order', // 图标的类型（'work-order'代表工单，‘staff’代表员工）
          text: 'xxxxxx', // 图标下方的文本描述
          data: {} // 点击图标，弹出弹窗要用到的数据
        },
        {
          center: [116.39, 39.90], // 经纬度坐标
          type: 'work-order', // 图标的类型（'work-order'代表工单，‘staff’代表员工）
          text: 'xxxxxx', // 图标下方的文本描述
          data: {} // 点击图标，弹出弹窗要用到的数据
        },
        {
          center: [116.39, 39.90], // 经纬度坐标
          type: 'work-order', // 图标的类型（'work-order'代表工单，‘staff’代表员工）
          text: 'xxxxxx', // 图标下方的文本描述
          data: {} // 点击图标，弹出弹窗要用到的数据
        }
      ]
    }
  },
  computed: {
    getLength(list) {
      // debugger
      return list.$children.length
    },
    showHeadList() {
      switch (this.dateType) {
        case 'day':
          return this.currentDayList.map((item, index) => {
            return {
              prop: index,
              label: item
            }
          })
        case 'week':
          return this.currentWeekList
        case 'month':
          return this.currentMonthList
        default:
          return this.currentDayList
      }
    },
    tableHeaderAlign() {
      return this.dateType === 'day' ? 'left' : 'center'
    }
  },
  mounted() {
    // this.test = new Date(2022,9,12)
    // console.log(this.test, this.test.getDay());
    console.log(moment().format('MM-DD'), moment().day())
    this.currentTimeLabel = this.dateFormat(moment())
    this.currentTime = moment()
    this.handleDayOriginData()
  },
  methods: {
    getCellHeight (num) {
      let height = 6 + num * 26
      return `height: ${height}px;`
    },
    redrawColorLump() {
      this.$nextTick(() => {
        this.$refs.easygantt.renderGantBlock()
      })
    },
    dateFormat(date) {
      return date.format('YYYY-MM-DD') + '  ' + this.weekLabelList[date.day()]
    },
    /**
     * 根据当前的视图模式（月视图、周视图、日视图），将时间戳转化为对应的格式
     *
     * @param {number} timestamp 时间戳
     */
    timestampToTime(timestamp) {
      if (this.dateType === 'day') {
        return +moment(timestamp).format('HH')
      } else {
        return moment(timestamp).format('MM-DD')
      }
    },
    handleDayOriginData() {
      this.tableData = []
      this.originData.forEach((staff, index) => {
        let mark = {
          id: staff.id,
          title: staff.staffName,
          order: index,
          avatar: staff.avatar,
          workOrderList: staff.workOrderList,
          data: []
        }
        staff.workOrderList.forEach(workOrder => {
          let start = this.timestampToTime(workOrder.startTime)
          let end = this.timestampToTime(workOrder.endTime)
          mark.data.push({
            start,
            end,
            id: workOrder.id,
            name: workOrder.workOrderName,
            state: workOrder.state === 'completed' ? 'success' : ''
          })
        })
        console.log(mark, 'mark')
        this.tableData.push(mark)
      })
      this.redrawColorLump()
    },
    handleWeekMonthOriginData() {
      this.originData.forEach((staff, index) => {
        let mark = {
          id: staff.id,
          title: staff.staffName,
          order: index,
          data: []
        }
        staff.workOrderList.forEach(workOrder => {
          let start = this.timestampToTime(workOrder.startTime)
          let end = this.timestampToTime(workOrder.endTime)
          mark.data.push({
            start,
            end,
            name: workOrder.workOrderName
          })
        })
        console.log(mark, 'mark')
        this.tableData.push(mark)
      })
    },
    /**
     * 改变甘特图的视图模式。
     *
     * @param {string} type 要改变的视图格式。
     */
    changeDateType(type) {
      if (type === this.dateType) return
      this.dateType = type
      this.currentTime = moment()
      this.currentTimeLabel = this.dateFormat(this.currentTime)
      if (type === 'week') {
        this.getNextWeekList()
      }
      if (type === 'month') {
        this.getMonthList(moment(this.currentTime._d))
        this.currentTimeLabel = this.currentTime.format('YYYY年MM月')
      }
      this.handleDayOriginData()
    },
    /**
     * 获取当前时间开始，7天的时间信息并存到currentWeekList里
     */
    getLastWeekList() {
      let baseTime = moment(this.currentTime._d)
      for (let i = 0; i < this.currentWeekList.length; i++) {
        baseTime.subtract(1, 'days')
        let date = baseTime.format('MM-DD')
        let weekLabel = this.weekLabelList[baseTime.day()]
        this.currentWeekList[i] = {
          label: `${date} ${weekLabel}`,
          prop: date
        }
      }
      this.currentWeekList.reverse()
    },
    /**
     * 获取当前时间之前7天的时间信息并存到currentWeekList里
     */
    getNextWeekList() {
      let baseTime = moment(this.currentTime._d)
      for (let i = 0; i < this.currentWeekList.length; i++) {
        let date = baseTime.format('MM-DD')
        let weekLabel = this.weekLabelList[baseTime.day()]
        this.currentWeekList[i] = {
          label: `${date} ${weekLabel}`,
          prop: date
        }
        baseTime.add(1, 'days')
      }
    },
    /**
     * 获取指定月份的月份信息并赋值给currentMonthList
     *
     * @param {object}  moment 日期信息。
     */
    getMonthList(moment) {
      this.currentMonthList = []
      let monthLength = +moment.endOf('month').format('DD')
      this.currentMonthLength = monthLength
      let startDay = moment.startOf('month')
      for (let i = 1; i <= monthLength; i++) {
        let date = startDay.format('MM-DD')
        let weekLabel = this.weekLabelList[startDay.day()]
        startDay.add(1, 'days')
        this.currentMonthList.push({
          label: `${date} ${weekLabel}`,
          prop: date
        })
      }
      return startDay
    },
    /**
     * 切换至上一阶段时间。
     *
     * @param {string} type 要改变的视图格式。
     */
    lastStageDate() {
      switch (this.dateType) {
        case 'day':
          this.currentTime.subtract(1, 'days')
          this.currentTimeLabel = this.dateFormat(this.currentTime)
          break;
        case 'week':
          this.getLastWeekList()
          this.currentTime = this.currentTime.subtract(7, 'days')
          this.currentTimeLabel = this.dateFormat(this.currentTime)
          break;
        case 'month':
          this.currentTime = this.currentTime.subtract(1, 'month')
          this.currentTimeLabel = this.currentTime.format('YYYY年MM月')
          this.getMonthList(moment(this.currentTime._d))
          break;
        default:
          break;
      }
      // to do 请求接口
      this.handleDayOriginData()
    },
    /**
     * 切换至下一阶段时间。
     *
     * @param {string} type 要改变的视图格式。
     */
    nextStageDate() {
      switch (this.dateType) {
        case 'day':
          this.currentTime = this.currentTime.add(1, 'days')
          this.currentTimeLabel = this.dateFormat(this.currentTime)
          break;
        case 'week':
          this.currentTime = this.currentTime.add(7, 'days')
          this.currentTimeLabel = this.dateFormat(this.currentTime)
          this.getNextWeekList()
          break;
        case 'month':
          this.currentTime = this.currentTime.add(1, 'month')
          this.currentTimeLabel = this.currentTime.format('YYYY年MM月')
          this.getMonthList(moment(this.currentTime._d))
          break;
        default:
          break;
      }
      // to do 请求接口
      this.handleDayOriginData()
    }
  }
}
</script>

<style lang="scss">
.gantt {
  width: 1100px;
  border: 1px solid #e5e6eb;
  margin: 0 auto;
  padding: 0px;
  height: 800px;
  .staff-search {
    box-sizing: border-box;
    height: 44px;
    width: 200px;
    float: left;
  }
  .gantt-header {
    height: 44px;
    border-left: 1px solid #e5e6eb;
    box-sizing: border-box;
    font-size: 14px;
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &__left {
      color: #646566;
    }
    &__center {
      color: #323233;
      font-size: 14px;
      font-family: PingFangSC-Medium;
      cursor: pointer;
      .current-time {
        margin: 0 24px;
      }
    }
    &__right {
      cursor: pointer;
      width: 80px;
      display: flex;
      justify-content: space-between;
      color: #646566;
      .highlight {
        color: #FF8C2E;
      }
    }
  }
  .gantt-table {
  }
}
</style>