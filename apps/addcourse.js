import fs from 'fs'

export class AddCourse extends plugin {
  constructor () {
    super({
      name: '课程插件-创建课表',
      dsc: '',
      event: 'message',
      rule: [
        {
          reg: '#?创建课表',
          fnc: 'AddCourse'
        }
      ]
    })
  }

  async AddCourse (e) {
    const regex = /#?创建课表星期([一二三四五六日])\s+(\d{1,2})\s+(.+?)\s+(.+?)\s+第(\d{1,2})周到第(\d{1,2})周(?:除去奇数周|除去偶数周)?/
    const match = e.msg.match(regex)
    if (!match) {
      e.reply('格式不正确，请按照以下格式输入：\n#创建课表星期一 12(第1节,持续节数) 语文 翻斗二号 1到5周')
    } else {
      this.writeCourse(e, match)
    }
  }

  writeCourse (e, match) {
    const userid = e.user_id
    const dayMap = { 一: 'Mon', 二: 'Tue', 三: 'Wed', 四: 'Thu', 五: 'Fri', 六: 'Sat', 日: 'Sun' }
    const day = dayMap[match[1]]
    const time = match[2]
    const course = match[3]
    const classroom = match[4]
    const weekStart = parseInt(match[5], 10)
    const weekOver = parseInt(match[6], 10)
    const oddEven = match[7]
    const path = `./plugins/Course-Plugin/data/${userid}.json`

    if (!fs.existsSync(path)) {
      fs.writeFileSync(path, JSON.stringify({
        time: {
          1: '8:00',
          2: '9:00',
          3: '10:00',
          4: '11:00',
          5: '14:00',
          6: '15:00',
          7: '16:00',
          8: '17:00',
          9: '20:00',
          10: '21:00'
        },
        Mon: {

        },
        Tue: {

        },
        Wed: {

        },
        Thu: {

        },
        Fri: {

        },
        Sat: {

        },
        Sun: {

        }
      }))
      e.reply('检测到没有课表，创建成功！')
    }
    let timeArray = []
    for (let i = weekStart; i <= weekOver; i++) {
      if (oddEven === '除去奇数周' && i % 2 !== 0) continue
      if (oddEven === '除去偶数周' && i % 2 === 0) continue
      timeArray.push(i)
    }
    const courseObject = {
      [time]: {
        class: course,
        place: classroom,
        time: timeArray
      }
    }
    const data = JSON.parse(fs.readFileSync(path))
    data[day] = { ...data[day], ...courseObject }
    fs.writeFileSync(path, JSON.stringify(data))
    e.reply('课表更新成功！')
  }
}
