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

var data = [];

/**
* Initial point to starting crawler
*/
rp(options)
  .then(async function($) {
    const content = $('.container').children();
    const newsFeed = cheerio.load(content[3].children)('.m_content').children()[1]
    var promises = []
    await newsFeed.children.forEach( async (val, key) => {
      if (val.name === 'li' && JSON.stringify(val.attribs) === '{}') {
        var promise = new Promise(function(resolve, reject) {
          resolve(getDetail(val.children[1].children[3].children[3].attribs.href))
        });
        promises.push(promise);
      }
    })
    await Promise.all(promises)
  })
  .catch(function(err) {
    console.log(err);
  });

function getDetail(url) {
  const optionsDetail = {
    uri: url,
    transform: function(body) {
      return cheerio.load(body);
    }
  };
  rp(optionsDetail)
    .then(async function($) {
      const content = $('.container').children();
      const article = content[3].children[3].children[17].children;
      const dateCreated = article[3].children[1].children[0].data;
      const newsTitle = article[3].children[5].children[0].data;
      const author = article[3].children[7].children[0].data;
      let contentArticle = '';
      await article[37].children[1].children.forEach((val) => {
        if (val.type === 'text') {
          if (val.data.slice(0, 2) !== '') {
            contentArticle = `${contentArticle} ${val.data}`;
          }
        }
        if (val.type === 'tag' && val.name === 'b') {
          contentArticle = `${contentArticle} ${val.children[0].data}`;
        }
        if (val.type === 'tag' && val.name === 'em') {
          contentArticle = `${contentArticle} ${val.children[0].data}`;
        }
      })
      await console.log(contentArticle);
      await data.push({ dateCreated, newsTitle, author, contentArticle})
      await writeToJSON(JSON.stringify(data))
    })
    .catch(function(err) {
      console.log(err);
    });
}

/**
* Writing to JSON file
* @param
* text: text
*/
function writeToJSON(text) {
  fs.writeFile('newsFeedsData.json', text, (err) => {
    if (err) throw err;
    console.log('Data saved!');
  });
}
