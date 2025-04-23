import fs from 'fs'

export class CheckCourse extends plugin {
  constructor () {
    super({
      name: '课程插件-查询课表',
      dsc: '',
      event: 'message',
      rule: [
        {
          reg: '#?查询(明天|明日|今日|今天)课表',
          fnc: 'checkCourse'
        }
      ]
    })
  }

  async checkCourse (e) {
    let DT = e.msg.replace(/#?查询/g, '').replace(/课表/g, '').trim()
    let Class = ''
    if (DT === '今天' || DT === '今日') {
      Class = this.GetClass(e, 'today')
    } else {
      Class = this.GetClass(e, 'tomorrow')
    }
    e.reply(DT + '的课表如下：\n' + Class)
  }

  GetClass (e, day) {
    let userid = e.user_id
    const path = `./plugins/Course-Plugin/data/${userid}.json`
    let now = new Date()
    let dayOfWeek = now.getDay()
    let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    if (day === 'today') {
      day = days[dayOfWeek]
    } else {
      if (dayOfWeek === 6) {
        day = days[0]
      } else {
        day = days[dayOfWeek + 1]
      }
    }
    try {
      const data = JSON.parse(fs.readFileSync(path, 'utf-8'))
      if (!data[day] || Object.keys(data[day]).length === 0) {
        return '没有找到课程哦~'
      } else {
        let reply = ''
        const sortedKeys = Object.keys(data[day]).sort((a, b) => {
          return parseInt(a, 10) - parseInt(b, 10)
        })
        for (const key of sortedKeys) {
          let course = data[day][key]
          const [S, E] = key.split('')
          const startTime = data.time[S]
          const endTime = this.addMinutesToTime(startTime, E * 60 - 10)
          reply += `课程：${course.class}\n地点：${course.place}\n时间：${startTime}-${endTime}\n\n`
        }
        return reply.trim()
      }
    } catch (error) {
      logger.error('查询失败：', error)
      return '查询失败，请检查配置文件：' + error.message
    }
  }

  addMinutesToTime (time, minutes) {
    const date = new Date()
    const [hours, mins] = time.split(':').map(Number)
    date.setHours(hours, mins, 0, 0)
    date.setMinutes(date.getMinutes() + minutes)
    const newHours = date.getHours().toString().padStart(2, '0')
    const newMins = date.getMinutes().toString().padStart(2, '0')
    return `${newHours}:${newMins}`
  }
}
