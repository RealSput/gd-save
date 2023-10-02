const {
    parse
} = require('node-html-parser'); // not exactly used for HTML lmao, similar enough though
const zlib = require('zlib');
const fs = require('fs');

let encode_level = (level_string) => {
    let gzipped = zlib.gzipSync(level_string);
    let base64_encoded = gzipped.toString('base64url');
    return base64_encoded;
};

let decode_level = (data) => {
    const base64_decoded = Buffer.from(data, 'base64url');
    const decompressed = zlib.gunzipSync(base64_decoded);
    return decompressed.toString();
}

const filename = `${process.env.localappdata}\\GeometryDash\\CCLocalLevels.dat`;
let output = [];

const readStream = fs.createReadStream(filename);

readStream.on('data', (chunk) => output.push(chunk));

let level_name = null;

readStream.on('end', function() {
    let last_level;

    let add_to_level;

    output = Buffer.concat(output);
    for (let i = 0; i < output.length; i++) {
        output[i] = output[i] ^ 11; // XOR decrypts buffer
    }
    output = zlib.unzipSync(Buffer.from(output.toString(), 'base64')).toString();
    fs.writeFileSync('cock.xml', output)
    output = parse(output); // Base64 decodes savefile, then unzips savefile and parses XML

    // todo: add methods for editing & exporting levels
    let old_copy = output;
    let info = output.childNodes[1].childNodes[0].childNodes[1].childNodes;
    for (let i in info) {
        let curr = info[i]
        if (curr.rawTagName == "d") {
            let tags = curr.childNodes; // tags reference
            let dat = {}
            tags.forEach((tag, i) => {
                if (tag.rawTagName == "k") {
                    if (tag.childNodes[0]._rawText == "k4") {
                        let decoded = tags[i + 1].childNodes[0]._rawText;
                        dat.levelstring = decode_level(tags[i + 1].childNodes[0]._rawText);
                        dat.raw = tags[i + 1].childNodes[0]._rawText;
                        add_to_level = (lvlstr) => {
                            tags[i + 1].childNodes[0]._rawText = encode_level(decode_level(tags[i + 1].childNodes[0]._rawText) + lvlstr);
                            dat.levelstring = decode_level(tags[i + 1].childNodes[0]._rawText) + lvlstr;
                            dat.raw = tags[i + 1].childNodes[0]._rawText;
                        }
                    }

                    if (tag.childNodes[0]._rawText == "k2") {
                        dat.name = tags[i + 1].childNodes[0]._rawText;
                    }
                }
            })
            if (!level_name) {
                last_level = dat;
                break;
            } else {
                if (dat.name == level_name) {
                    last_level = dat;
                    break;
                }
            }
        }
    }

    if (!last_level) throw new Error(`Level "${level_name}" not found in savefile!`)
    
    // these are just some tests and shit dw about it (the tests fail)
    let old_doc = output.toString();
    console.log('before', last_level)
    add_to_level("1,1,2,100,3,15;");
    console.log('after', last_level)

    fs.writeFileSync('debug.xml', output.toString())
    let alm = zlib.deflateSync(output.toString()).toString('base64').split('');
    for (let i = 0; i < alm.length; i++) {
        alm[i] = String.fromCharCode(alm[i].charCodeAt() ^ 11); // XOR decrypts buffer
    }

    fs.writeFileSync('debug_encrypted.xml', alm.join(''));
    console.log(alm)
    console.log('WRITE FINISH')
});
