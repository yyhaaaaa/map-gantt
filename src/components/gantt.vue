<template>
  <div class="easy-gantt">
    <div class="head-sort" v-if="sort.row && sort.column">
      <span class="row">{{sort.row}}</span>
      <span class="column">{{sort.column}}</span>
    </div>
    <el-table
      class="ganttable"
      ref="elTable"
      :data="showTableData"
      @row-click="rowClick"
      border
      >
      <el-table-column
        width="200"
        fixed>
        <template slot-scope="scope">
          <div class="staff-info">
            <div class="staff">
              <div class="img"></div>
              <div class="name">{{ scope.row.title }}</div>
            </div>
            <div class="workorder-num">({{scope.row.data.length}})</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-for="column in ganttHead"
        :key="column.prop"
        :label="column.label"
        :data="column"
        width="180">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top">
            <p>点击单元格指派</p>
            <div class="td-box" slot="reference" :class="`row-id${scope.row.id}`" :data-td="column.prop" :data-id="scope.row.id"></div>
          </el-popover>
          <div class="cell-block" :style="getCellHeight(scope.row[column.prop])"  :data-td="column.prop">
            <template v-for="(mark, index) in scope.row[column.prop]">
              <div
                v-if="index < limit && mark.name"
                class="ganttd"
                :class="{'ganttd__success': mark.state === 'success'}"
                :key="index"
                :data-td="column.prop"
                @click="tdClick(scope.row[column.prop], mark)"
                :style="getTdStyle(mark, index)">{{ mark.name }}</div>
            </template>
            <el-popover
              v-if="scope.row.hide[column.prop] && scope.row.hide[column.prop].hideNum"
              placement="bottom"
              width="288"
              trigger="click">
              <div class="more-workorder-list">
                <div class="color-lump"
                  :class="{'ganttd__success': mark.state === 'success'}"
                  v-for="(mark, index) in scope.row.hide[column.prop].hideList" :key="index">
                  {{mark.name}}
                </div>
              </div>
              <div
                slot="reference"
                class="ganttd__else"
                :class="{'ganttd__else_shadow': cellMoreShadow}"
                :style="getTdStyle({ beyondBlock: 0 }, limit)"
                :data-td="column.prop"
                >
                还有 {{ scope.row.hide[column.prop].hideNum }} 个{{ cellMoreTitle }}...
              </div>
            </el-popover>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      v-if="dialogVisible"
      title="提示"
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose">
      <span>确定添加</span>
      <span>{{ headEnum[handleStart].label }}</span>
      <span>至</span>
      <span>{{ headEnum[handleEnd].label }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="confirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<!-- eslint-disable no-prototype-builtins -->
<script>
export default {
  name: 'EasyGantt',
  components: {
    // DateTable
  },
  props: {
    // 行数限制
    limit: {
      type: Number,
      default: 2
    },
    // 表格横纵轴代表的数据类型
    sort: {
      type: Object,
      default: () => {}
    },
    // 更多标题
    cellMoreTitle: {
      type: String,
      default: '工单'
    },
    // 鼠标滑动添加
    moveToAdd: {
      type: Boolean,
      default: true
    },
    // 使用自定义弹窗
    usePersonalTips: {
      type: Boolean,
      default: false
    },
    // 更多是否展示阴影
    cellMoreShadow: {
      type: Boolean,
      default: true
    },
    ganttHead: {
      type: Array,
      default: () => []
    },
    ganttData: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    tdBlockHeight () {
      return 25
    },
    tdPaddingTop () {
      return 9
    }
  },
  data () {
    return {
      date: new Date(),
      dialogVisible: false,
      headEnum: {},
      showTableData: [],
      handleRowid: null,
      handleStart: null,
      handleEnd: null,
      startLeft: null,
      startTop: null,
      moveLeft: null,
      moveTop: null
    }
  },
  watch: {
    ganttHead: {
      handler () {
        this.headEnumInit()
      },
      deep: true,
      immediate: true
    }
  },
  created () {
    this.headEnumInit()
    this.renderGantBlock()
  },
  methods: {
    headEnumInit () {
      this.headEnum = {}
      this.ganttHead.forEach((item, index) => {
        this.$set(this.headEnum, item.prop, { label: item.label, block: index })
      })
    },
    /**
     * @description: 渲染甘特图色块数据处理
     */
    renderGantBlock () {
      // 数据初过滤，获取每格需要渲染的色块数据
      const _showTableData = this.ganttData.map(data => {
        const obj = {}
        const _data = JSON.parse(JSON.stringify(data))
        _data.data.forEach((item, index) => {
          if (!Object.prototype.hasOwnProperty.call(obj, item.start)) {
            obj[item.start] = []
          }
          item.beyondBlock = this.beyondBlock(item) // 超出格子数
          item.effect = true // 有效格子
          obj[item.start].push(item)
        })
        return {
          ..._data,
          ...obj
        }
      })
      console.log(JSON.parse(JSON.stringify(_showTableData)))
      // 遍历色块数据，处理需要跨时间的色块
      // oi 外层index
      for (let oi = 0; oi < _showTableData.length; oi++) {
        const rowData = _showTableData[oi] // 行数据
        rowData.hide = {} // 更多统计
        // 按顺序遍历需要处理的色块
        this.ganttHead.forEach((head) => {
          const _prop = head.prop // 当前色块prop
          if (Array.isArray(rowData[_prop])) { // 若为数组，代表当前色块有数据
            // tdi 当前格子的数据index
            let hideNum = 0
            let hideList = []
            for (let tdi = 0; tdi < rowData[_prop].length; tdi++) { // 遍历当前td内的数据，找出有超出的数据，为其后面数据添加占位数据
              if (!rowData[_prop][tdi]) {
                rowData[_prop][tdi] = {}
              }
              if (tdi >= this.limit && !rowData[_prop][tdi].hasOwnProperty('visible')) {
                rowData[_prop][tdi].visible = false
              } else if (tdi < this.limit && !rowData[_prop][tdi].hasOwnProperty('visible')) {
                rowData[_prop][tdi].visible = true
              }
              if (rowData[_prop][tdi].visible === false && rowData[_prop][tdi].effect) {
                hideNum += 1
                hideList.push(this.getHideInfo(rowData[_prop][tdi].id, rowData))
              }
              rowData[_prop][tdi].index = tdi
              const beyondBlock = rowData[_prop][tdi].beyondBlock // 超出的格子数
              if (beyondBlock > 0) { // 若有超出格子数 则后面需要有空数据占位
                let mark = 1
                while (mark <= beyondBlock) { // 超出多少格子，后面就补多少个
                  const index = this.ganttHead.findIndex(head => head.prop === _prop) + mark // 当前 td 在表头的index, +mark 为下一个td
                  const _nextProp = this.ganttHead[index].prop // 获取下一个td的 prop ，用于给其添加占位数据
                  let replaceFlag = true
                  // if (_prop === '2') debugger
                  if (!Array.isArray(rowData[_nextProp])) {
                    replaceFlag = false
                    // const length = rowData[_prop].filter(_ => _.hasOwnProperty('name')).length
                    const length = rowData[_prop].length
                    rowData[_nextProp] = new Array(length).fill(null)
                  }
                  const { id } = rowData[_prop][tdi]
                  if (!replaceFlag) {
                    if (!rowData[_nextProp][tdi]) {
                      rowData[_nextProp][tdi] = {
                        effect: true
                      }
                    }
                    // if (rowData[_prop][tdi].visible) {
                    //   rowData[_nextProp][tdi].visible = true
                    // } else {
                    // // rowData[_nextProp].splice(tdi, 0, { visible: false })
                    //   rowData[_nextProp][tdi].visible = false
                    // }
                    rowData[_nextProp][tdi].visible = rowData[_prop][tdi].visible
                    rowData[_nextProp][tdi].id = id
                  } else {
                    if (!rowData[_nextProp][tdi]) {
                      rowData[_nextProp].splice(tdi, 1, { visible: rowData[_prop][tdi].visible, effect: true, id: id })
                    } else {
                      rowData[_nextProp].splice(tdi, 0, { visible: rowData[_prop][tdi].visible, effect: true, id: id })
                    }
                  }

                  mark++
                }
              }
            }
            rowData.hide[_prop] = {
              hideNum,
              hideList
            }
          }
        })
      }
      this.showTableData = _showTableData
      this.$nextTick(() => {
        this.$refs.elTable.doLayout()
      })
    },
    /**
     * @description: 根据id获取对应的行信息
     * @return {object} 匹配到的行信息
     */
    getHideInfo (id, row) {
      return row.data.find(td => td.id === id)
    },
    /**
     * @description: 计算当前数据是否有跨时间显示
     * @return {Number} 超出的块数，0表示只占本格
     */
    beyondBlock (data) {
      const startBlock = this.headEnum[data.start].block
      const endBlock = this.headEnum[data.end].block
      return endBlock - startBlock
    },
    tdClick (row, item) {
      this.$emit('itemClick', item)
      console.log('色块', item)
    },
    rowClick(row) {
      this.$emit('rowClick', row)
      console.log('row', row)
    },
    /**
     * @description: 获取td内渲染的色块样式，在单元格内的位置为：
     */
    getTdStyle (data, index) {
      const right = -data.beyondBlock * 100 // 负数为跨时间渲染，需要占到隔壁时间
      return `
      user-select: none;
      height: ${this.tdBlockHeight}px;
      right: calc(${right}% + 10px);
      top: ${index * this.tdBlockHeight + this.tdPaddingTop * (index + 1)}px;
      `
      // right: calc(${right}% + 10px);  距离单元格右侧距离，
      // top: ${index * 25 + 12}px （数据index * 色块高度 + 单元格上边距12）
    },
    /**
     * @dscription: 单元格高度。 渲染色块是 absolute 布局，所以单元格也需要随着色块数，自动撑开
     */
    getCellHeight (data) {
      let height = this.tdBlockHeight
      if (data && data.length) {
        const length = data.length > this.limit ? this.limit + 1 : data.length
        height = length * this.tdBlockHeight + (length - 1) * this.tdPaddingTop
      }
      return `height: ${height}px;`
    },
    /**
     * @description: 确认操作
     */
    confirm () {
      const select = {
        rowid: this.handleRowid,
        start: this.handleStart,
        end: this.handleEnd
      }
      this.$emit('seletcData', select)
      this.handleClose()
    },
    handleClose (type) {
      this.elementCrash(type)
      this.dialogVisible = false
      this.init()
    },
    init () {
      this.handleRowid = null
      this.handleStart = null
      this.handleEnd = null
      this.startLeft = null
      this.startTop = null
      this.moveLeft = null
      this.moveTop = null
    },
    mousedown (e) {
      if (!this.moveToAdd) {
        return
      }
      // const reg = /row-id\d+/
      // this.handleRow = e.target.className.match(reg)[0]
      if (['ganttd', 'ganttd__else'].includes(e.target.className)) return
      this.handleRowid = e.target.dataset.id // 数据row id
      this.handleStart = e.target.dataset.td // 开始时间
      this.startLeft = e.clientX
      this.startTop = e.clientY
      const table = document.documentElement.querySelector('.ganttable')
      table.addEventListener('mousemove', this.mousemove)
      window.addEventListener('mouseup', this.mouseup)
    },
    mousemove (e) {
      this.moveLeft = e.clientX
      this.moveTop = e.clientY
      this.crashPlaceholder(this.moveLeft, this.moveTop, this.startLeft, this.startTop)
      this.elementCrash()
    },
    mouseup (e) {
      // console.log(e)
      this.handleEnd = e.target.dataset.td// 结束时间
      const table = document.documentElement.querySelector('.ganttable')
      table.removeEventListener('mousemove', this.mousemove)
      window.removeEventListener('mouseup', this.mouseup)
      if (this.handleEnd) {
        if (this.beyondBlock({ start: this.handleStart, end: this.handleEnd }) < 0) { // 从右往左选
          [this.handleStart, this.handleEnd] = [this.handleEnd, this.handleStart] // 交换开始合结束位置
        }
        if (this.usePersonalTips) {
          const select = {
            start: this.handleStart,
            end: this.handleEnd
          }
          this.$emit('seletcData', select)
          console.log(select)
          this.handleClose('init')
          return
        }
        this.dialogVisible = true
      } else {
        this.handleClose('init')
      }
    },
    // 生成占位块
    crashPlaceholder (A, B, C, D) {
      // 开始的行列
      const a = A > C ? C : A
      const b = B > D ? D : B

      const hasshow = document.getElementById('show')
      if (hasshow) {
        document.body.removeChild(hasshow)
      }

      const show = document.createElement('div')
      show.id = 'show'
      show.style.width = Math.abs(A - C) + 'px'
      show.style.height = Math.abs(B - D) + 'px'
      show.style.position = 'fixed'
      show.style.left = a + 'px'
      show.style.top = b + 'px'
      // show.style.border = '1px dotted black'
      // show.style.backgroundColor = 'blue'
      document.body.appendChild(show) // 鼠标滑动的区域
    },
    // 碰撞检测 判断鼠标滑动区域与table中重合的部分 进行高亮
    elementCrash (type) {
      const td = document.documentElement.getElementsByClassName(`row-id${this.handleRowid}`)
      for (let i = 0; i < td.length; i++) {
        const _this = td[i]
        if (this.dialogVisible || type === 'init') {
          _this.className = _this.className.replace(' easy-gantt__showColor', '')
          continue
        }
        const domrect = _this.getBoundingClientRect()
        const t1 = domrect.top
        const l1 = domrect.left
        const r1 = domrect.left + domrect.width
        const b1 = domrect.top + domrect.height

        const show = document.getElementById('show')
        const domrect2 = show.getBoundingClientRect()
        const t2 = domrect2.top
        const l2 = domrect2.left
        const r2 = domrect2.left + domrect2.width
        const b2 = domrect2.top + domrect2.height

        // 鼠标滑动区域 与 当前行的单元格重叠，即为选中的时间跨度
        if (b1 < t2 || l1 > r2 || t1 > b2 || r1 < l2) {
          _this.className = _this.className.replace(' easy-gantt__showColor', '')
        } else {
          _this.className = _this.className.replace(' easy-gantt__showColor', '')
          _this.className = _this.className + ' easy-gantt__showColor'
        }
      }
    }
  }
}
</script>

<style>
.easy-gantt__showColor {
  background-color: rgb(36, 141, 245, 0.3) !important;
}
.el-table__header tr,
.el-table__header th {
  height: 44px;
  background-color: #F7F8FA;
}
</style>
<style scoped>
.color-lump {
  cursor: pointer;
  margin: 6px;
  padding: 0 6px;
  height: 20px;
  line-height: 20px;
  width: 264px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 4px;
  background-color: #248DF5;
  color: #fff;
  font-size: 12px; 
}
.head-sort {
  z-index: 10;
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
  border-left: 1px solid #e5e6eb;
  border-top: 1px solid #e5e6eb;
  height: 44px;
  width: 200px;
  font-size: 14px;
  color: #969799;
  background-image:
    linear-gradient(to bottom left, white 49.5% , #e5e6eb, white 51.5%)
}
.head-sort .row {
  position: absolute;
  top: 8px;
  right: 8px;
}
.head-sort .column {
  position: absolute;
  left: 8px;
  bottom: 8px;
}
.staff-info {
  font-size: 14px;
  display: flex;
  justify-content: space-between;
}
.staff-info .workorder-num {
  height: 28px;
  color: #e5e6eb;
  line-height: 28px;
}
.staff-info .staff {
  width: 100px;
  display: flex;
  justify-content: left;
}
.staff-info .staff .img {
  height: 28px;
  width: 28px;
  margin-right: 16px;
  border-radius: 14px;
  background-color: #e5e6eb;
}
.staff-info .staff .name {
  height: 28px;
  color: #323233;
  line-height: 28px;
}
.easy-gantt {
  position: relative;
  width: 100%;
  height: 100%;
}
.ganttable {
  /* min-width: max-content; */
  width: max-content;
}
.ganttd {
  cursor: pointer;
  position: absolute;
  display: flex;
  align-items: center;
  border-radius: 4px;
  padding: 0px 12px;
  background-color: #248DF5;
  left: 10px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  z-index: 1;
  color: #fff;
  font-size: 12px;
  text-align: left;
  font-family: PingFangSC-Regular;
}
.ganttd:hover, .color-lump:hover {
  background-color: #4DACFF;
}
.ganttd:active, .color-lump:active {
  background-color: #186FD2;
}
.ganttd__success {
  background-color: #00C241;
}
.ganttd__success:hover {
  background-color: #27D65C;
}
.ganttd__success:active {
  background-color:#00AC3F;
}
.ganttd__else {
  position: absolute;
  border-radius: 4px;
  padding: 0px 12px;
  left: 10px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  z-index: 1;
  color: rgba(50, 50, 51, 1);
  font-size: 12px;
  text-align: left;
  font-family: PingFangSC-Regular;
}
.ganttd__else_shadow {
  background-color: #f3f3f3;
}
.td-box {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
