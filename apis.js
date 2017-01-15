/**
 * Created by xiaopingfeng on 12/30/16.
 */

// http://59.108.104.251:58123/bin/get/PhenoTips/PedigreeImageService?id=P0000081&format=raster
// http://59.108.104.251:58123/rest/patients/eid/20160902_Beiyi_LJX_plus

var rp = require('request-promise');

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

var cheerio = require('cheerio');

function getPedigreeByPid(pid) {
    var options = {
        method: 'GET',
        url: 'http://59.108.104.251:58123/bin/get/PhenoTips/PedigreeImageService',
        qs: {id: pid},
        headers: {
            authorization: 'Basic d3V4aW46d3V4aW4xMjM='
        }
    }
    return rp(options)
        .then(function (result) {
            var svg_modified = result.replaceAll('fill="#fee090"', 'fill="#5e5e5e"');
            var $ = cheerio.load(svg_modified);
            $('.pedigree-partnership-circle').remove();
            console.log($('.pedigree-partnership-circle').html());
            return svg2png($.html());
        })
}
function getPedigreeByEdi(eid) {
    var options = {
        method: 'GET',
        url: 'http://59.108.104.251:58123/rest/patients/eid/' + eid,
        headers: {
            "authorization": 'Basic d3V4aW46d3V4aW4xMjM=',
            "Content-Type": "application/json"
        }
    }
    return rp(options).then(function (result) {
        return JSON.parse(result).id;
    });
}

var express = require('express')
var app = express()
const svg2png = require("svg2png");
app.get('/', function (req, res) {
    var pid = req.query.pid;
    var eid = req.query.eid;

    (function () {
        if (eid) {
            return getPedigreeByEdi(eid);
        } else {
            return Promise.resolve(pid);
        }
    })()
        .then(function (pid) {
            console.log('pid:' + pid);
            return getPedigreeByPid(pid);
        })
        .then(function (buff) {
            res.writeHead(200, {'Content-Type': 'image/png'});
            res.write(buff);
            res.send();
        }, function (err) {
            // console.log(err);
            res.status(500);
            res.write(err);
            res.send();
        })

});

app.listen(8001, function () {
    console.log('Example app listening on port 3000!')
})
