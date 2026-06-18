import { chromium } from "playwright";
const b = await chromium.launch({ args:["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"] });
async function shoot(w, name){
  const p = await b.newPage({ viewport:{width:w,height:760}, deviceScaleFactor:2 });
  await p.goto("http://localhost:3007", { waitUntil:"domcontentloaded", timeout:60000 });
  await p.addStyleTag({ content:`nextjs-portal,[data-next-badge-root]{display:none!important}` });
  await p.waitForTimeout(2500);
  const el = p.locator('[class*="logoTonight"]').first();
  if(await el.count()){ const box = await el.boundingBox(); console.log(name,"box:",JSON.stringify(box&&{x:Math.round(box.x),w:Math.round(box.width)}), "viewport",w); }
  // crop region around vertical center
  await p.screenshot({ path:`/tmp/eyebrow-${name}.png`, clip:{x:0,y:120,width:w,height:420} });
  await p.close();
}
await shoot(1440,"desktop");
await shoot(390,"mobile");
await b.close(); console.log("done");
