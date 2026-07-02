import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cssPath = path.join(__dirname, '../public/css/decode.css');
const lines = fs.readFileSync(cssPath, 'utf8').split(/\r?\n/);

const critical = [];
const deferred = [];

critical.push(...lines.slice(0, 291));
deferred.push(...lines.slice(291, 506));
critical.push(...lines.slice(506, 588));
deferred.push(...lines.slice(589, 816));
deferred.push(...lines.slice(816, 948));

const mq820 = lines.slice(949, 996);
const mq720 = lines.slice(997, 1005);
const mq600 = lines.slice(1006, 1023);
const mqReduce = lines.slice(1024);

critical.push(...mq820);
critical.push(...mq600.filter((l) => !l.includes('#onx-decode-result')));
deferred.push(...mq720);
deferred.push('  #onx-decode-result { padding: 22px 18px; }');
deferred.push('}');
critical.push(...mqReduce);

const stats = `/* Decode stats (hero strip) */
.decode-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-width: 560px;
  margin: 8px auto 0;
  padding-top: 8px;
}
.decode-stats__item {
  text-align: center;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 14px;
  border: 1px solid rgba(58, 68, 53, 0.12);
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 24px rgba(58, 68, 53, 0.06);
}
.decode-stats__val {
  font-family: var(--onx-font-serif);
  font-size: 32px;
  font-weight: 700;
  color: var(--onx-moss);
  line-height: 1;
}
.decode-stats__lbl {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #4a5445;
  margin-top: 6px;
}`;

critical.splice(critical.length - mqReduce.length, 0, stats);

const base = path.join(__dirname, '../public/css');
fs.writeFileSync(path.join(base, 'decode.css'), critical.join('\n') + '\n');
fs.writeFileSync(
  path.join(base, 'decode-deferred.css'),
  '/* Below-fold decode panel, results, neuro spotlight */\n' + deferred.join('\n') + '\n'
);

console.log('critical:', critical.length, 'lines, deferred:', deferred.length, 'lines');
