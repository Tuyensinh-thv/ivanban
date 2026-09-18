const fs = require('fs');
const JSZip = require('jszip');
const xml2js = require('xml-js');

async function extractDocx(inputPath, outputPath) {
    const data = fs.readFileSync(inputPath);
    const zip = await JSZip.loadAsync(data);
    const xml = await zip.file("word/document.xml").async("string");
    
    const result = xml2js.xml2js(xml, { compact: true, spaces: 2 });
    const body = result['w:document']['w:body'];
    const paragraphs = body['w:p'];

    const extractedData = {
        paragraphs: []
    };

    if (Array.isArray(paragraphs)) {
        paragraphs.forEach(p => {
            let text = "";
            const runs = p['w:r'];
            if (Array.isArray(runs)) {
                runs.forEach(r => {
                    if (r['w:t']) {
                        text += r['w:t']._text || r['w:t']._cdata || "";
                    }
                });
            } else if (runs && runs['w:t']) {
                text = runs['w:t']._text || runs['w:t']._cdata || "";
            }
            if (text.trim()) {
                extractedData.paragraphs.push(text.trim());
            }
        });
    }

    fs.writeFileSync(outputPath, JSON.stringify(extractedData, null, 2));
    console.log(`Extracted text to ${outputPath}`);
}

const args = process.argv.slice(2);
if (args.length < 2) {
    console.error("Usage: node extract_docx.js <input_docx> <output_json>");
    process.exit(1);
}

extractDocx(args[0], args[1]).catch(err => {
    console.error("Error extracting docx:", err);
    process.exit(1);
});
