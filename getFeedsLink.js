const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');
const URI = 'https://news.detik.com';
const options = {
  uri: URI,
  transform: function(body) {
    return cheerio.load(body);
  }
};

/**
* Initial point to starting crawler
*/
rp(options)
  .then(function($) {
    var data = [];
    const content = $('.container').children();
    const newsFeed = cheerio.load(content[3].children)('.m_content').children()[1]
    newsFeed.children.forEach((val, key) => {
      if (val.name === 'li' && JSON.stringify(val.attribs) === '{}') {
        data.push(val.children[1].children[3].children[3].attribs.href)
        writeToJSON(JSON.stringify(data))
      }
    })
  })
  .catch(function(err) {
    console.log(err);
  });

/**
* Writing to JSON file
* @param
* text: text
*/
function writeToJSON(text) {
  fs.writeFile('newsFeedsLink.json', text, (err) => {
    if (err) throw err;
    console.log('Data saved!');
  });
}
