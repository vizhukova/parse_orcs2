import http from 'http';
import fs, {writeFileSync} from 'fs';
import async from 'async';
import xlsx, { parse } from 'node-xlsx';
import { VKAPI } from 'vkontakte-api';

const VK_ACCESS_TOKEN = ''
const DELAY_BETWEEN_REQUESTS = {
    min: 60000 * 3, // 3 min
    max: 60000 * 5  // 5 min
}

const TEXT_FILE = './test.txt'
const JSON_FILE = './test_db.json'
const headers = [
    'vk_link',   
    'vk_avatar',
    'first_name',
    'last_name',
    'nickname',
    'bdate',
    'sex',
    'mobile_phone',
    'home_phone',
    'skype',
    'photo_id',
    'relation',
    'relatives',
    'career',
    'country',
    'city',
    'connections',
    'contacts',
    'education',
    'exports',
    'followers_count',
    'has_mobile',
    'has_photo',
    'interests',
    'last_seen',
    'lists',
    'military',
    'occupation',
    'personal',
    'can_post',
    'can_see_all_posts',
    'can_send_friend_request',
    'can_write_private_message',
    'photo_400_orig',
]

const api = new VKAPI({
    rps: 20,
    accessToken: VK_ACCESS_TOKEN,
    lang: 'en',
  });

var workSheetsFromFile = parse(INPUT_FILE)
const data = workSheetsFromFile[0]?.data

for (const dataObj of data) {
  const url = dataObj[0]
  const vkId = url?.replace('http://vk.com/id','')
  await searchInVk(vkId)
}

fs.readFile(JSON_FILE, function(err, json) {
  var array =  (json && JSON.parse(json)) || [];
  var result = array
  .map(resultObject => headers.map(header => {
      const value = resultObject[header] || '-'
      return typeof value === 'string' ? value : (value?.title || JSON.stringify(value))
  }))
  result.unshift(headers)

  var buffer = xlsx.build([{name: 'mySheetName', data: result}]);
  writeFileSync("./out.xlsx", buffer);
  console.log('buffer', buffer)
});

console.log('//////////////////////////////////')
console.log('/////////////FINISHED/////////////')
console.log('//////////////////////////////////')

const requestListener = function (req, res) {
  res.writeHead(200);
  res.end('Hello, World!');
}

const server = http.createServer(requestListener);
server.listen(8080);
console.log('server is listen in 8080 port')

function decodeField(field, value) {
    if(field === 'sex') {
        switch(value) {
            case 1: return 'женский'
            case 2: return 'мужской'
            default: return 'пол не указан'
        }
    }
    if(field === 'relation') {
        switch(value) {
            case 1: return 'не женат/не замужем'
            case 2: return 'есть друг/есть подруга'
            case 3: return 'помолвлен/помолвлена'
            case 4: return 'женат/замужем'
            case 5: return 'всё сложно'
            case 6: return 'в активном поиске'
            case 7: return 'влюблён/влюблена'
            case 8: return 'в гражданском браке'
            default: return 'не указано'
        }
    }
    if(field === 'has_mobile' || field === 'has_photo') {
        return value === 1 ? 'есть' : 'нет'
    }
    if(field === 'platform') {
        switch(value) {
            case 1: return 'мобильная версия'
            case 2: return 'приложение для iPhone'
            case 3: return 'приложение для iPad'
            case 4: return 'приложение для Android'
            case 5: return 'приложение для Windows Phone'
            case 6: return 'приложение для Windows 10'
            case 7: return 'полная версия сайта'
            default: return '-'
        }
    }
    if(field === 'last_seen') {
        return value ? {
            time: new Date(value?.time),
            platform: decodeField('platform', value?.platform)
        } : '-'
    }
    if(field === 'political') {
        switch(value) {
            case 1: return 'коммунистические'
            case 2: return 'социалистические'
            case 3: return 'умеренные'
            case 4: return 'либеральные'
            case 5: return 'консервативные'
            case 6: return 'монархические'
            case 7: return 'ультраконсервативные'
            case 8: return 'индифферентные'
            case 9: return 'либертарианские'
            default: return '-'
        }
    }
    if(field === 'people_main') {
        switch(value) {
            case 1: return 'коммунистические'
            case 1: return 'ум и креативность'
            case 2: return 'доброта и честность'
            case 3: return 'красота и здоровье'
            case 4: return 'власть и богатство'
            case 5: return 'смелость и упорство'
            case 6: return 'юмор и жизнелюбие'
            default: return '-'
        }
    } 
    if(field === 'life_main') {
        switch(value) {
            case 1: return 'семья и дети'
            case 2: return 'карьера и деньги'
            case 3: return 'развлечения и отдых'
            case 4: return 'наука и исследования'
            case 5: return 'совершенствование мира'
            case 6: return 'саморазвитие'
            case 7: return 'красота и искусство'
            case 8: return 'слава и влияние'
            default: return '-'
        }
    }
    if(field === 'smoking') {
        switch(value) {
            case 1: return 'резко негативное'
            case 2: return 'негативное'
            case 3: return 'компромиссное'
            case 4: return 'нейтральное'
            case 5: return 'положительное'
            default: return '-'
        }
    }
    if(field === 'alcohol') {
        switch(value) {
            case 1: return 'резко негативное'
            case 2: return 'негативное'
            case 3: return 'компромиссное'
            case 4: return 'нейтральное'
            case 5: return 'положительное'
            default: return '-'
        }
    }
    if(field === 'personal') {
      return value ? {
        political: decodeField('political', value?.political),
        people_main: decodeField('people_main', value?.people_main),
        life_main: decodeField('life_main', value?.life_main),
        smoking: decodeField('smoking', value?.smoking),
        alcohol: decodeField('alcohol', value?.alcohol),
        langs: value?.langs,
        religion: value?.religion,
        inspired_by: value?.inspired_by,
      } : '-'
    }
    return value
} 

async function searchInVk (vkId, numTry = 1) {
    if(! vkId) return
        return new Promise(async (resolve, reject) => {
            try {
                var userData = await api.users.get({
                    user_ids: [vkId],
                    fields: headers,
    
                })
                console.log('FOUND!', userData)
                userData.forEach(user => {
                    const vk_link = `https://vk.com/id${user?.id}`
                    const vk_avatar = user?.photo_400_orig
    
                    // Text file write
                    fs.appendFileSync(TEXT_FILE, `${user.first_name} ${user.last_name} ${vk_link} ${vk_avatar} ${user?.bdate} ${user?.city?.title}(${user?.country?.title}) last_seen: ${ new Date(user?.last_seen?.time * 1000).toLocaleDateString()} \n`)
    
                    // Json file write
                    const jsonData = {}
                    headers.forEach(header => {
                        jsonData[header] = decodeField(header, user?.[header])
                    })
                    jsonData['vk_link'] = vk_link
                    jsonData['vk_avatar'] = vk_avatar
    
                    fs.readFile(JSON_FILE, function(err, json) {
                        var array =  (json && JSON.parse(json)) || [];
                        array.push(jsonData);
                        fs.writeFile(JSON_FILE, JSON.stringify(array), function(err) {
                            if (err) {
                                console.log(err);
                                return;
                            }
                            console.log("The file was saved!");
                        });
                    });
                })
                resolve(userData)
            } catch(error) {
                console.log('!!!!', error, 'json: ', JSON.stringify(error))
                if (error?.errorInfo?.error_code === 6 || error?.code === 'ETIMEDOUT') {
                    if(numTry === 10) {
                        console.log('rejected', numTry)
                        reject(error)
                    }
                    console.log('timeout started')
                    randomiseRequestTimeout(searchInVk, vkId, numTry + 1)
                }
                console.log('rejected')
                reject(error)
            }
        })
}

// I changed in vkontakte-api lib in MessagesRepository.js randomId to random_id to solve the sending error
function sendMessage(user_id) {
    console.log(`sending msg started to ${user_id}...`)
    return api.messages.send({
        random_id: 0,
        user_id: +user_id,
        message: 'Привет! Хочу предупредить тебя, что если ты поедешь в Крым летом, то информация об этом будет передана в министерства иностранных дел всех государств. За подобное нарушение международного права тебе будет отказано в праве посещения любой другой страны мира, потому-что Крым - общепризнанная временно оккупированная территория Украины.',
    }).then(() => {
        console.log(`...sent msg to ${user_id}`)
        fs.appendFileSync(TEXT_FILE, `msg sent to ${user_id} \n`)
    }).catch(err => {
        fs.appendFileSync(TEXT_FILE, `msg ERROR  ${user_id} ${err} \n`)
        console.log(`error occured during sending msg to ${user_id}: ${err}`)
    })
}

async function randomiseRequestTimeout(request, ...params) {
    const delay = Math.floor(Math.random() * (DELAY_BETWEEN_REQUESTS.max - DELAY_BETWEEN_REQUESTS.min)) + DELAY_BETWEEN_REQUESTS.min;
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            request(params)
            .then(resolve)
            .catch(reject)
        }, delay);
    })
}

async function randomise(array, currIndex, func) {
    if(!array[currIndex]) {
        console.log('---ENDED---')
        return
    }
    func(array[currIndex]).then(() => {
        randomise(array, currIndex + 1, func)
    })
    
}


