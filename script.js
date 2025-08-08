// ========== โปรดแก้ค่า SHEET_ID และ WEBAPP_URL ให้ตรงกับของคุณก่อนดีพลอย ==========
const SHEET_ID = '13HPhyBXBmbPwEUKoj012qdRd1W3qD-h4AkqS7cAI_sQ'; // ตัวอย่างจากข้อมูลของคุณ
let WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbzf2V-fQsmh_5ba-Xb5wPmTESJhk9iqsry6oRVyNzICfoaI6R-mYPG1S2c0J_18eH6y/exec'; // <-- แก้ที่นี่หลัง deploy Apps Script

// ====== Helper: format date (ภาษาไทย) ======
function formatDateTH(date){
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('th-TH', options);
}

document.addEventListener('DOMContentLoaded', () => {
  // set current date display
  const currentDateElement = document.getElementById('currentDate');
  currentDateElement.textContent = formatDateTH(new Date());

  // tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  tabBtns.forEach(btn=>{
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      tabBtns.forEach(b=>{ b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
      tabContents.forEach(c=>{ c.classList.remove('active'); c.hidden = true; });

      btn.classList.add('active');
      btn.setAttribute('aria-selected','true');
      const target = document.getElementById(tabId);
      if (target) { target.classList.add('active'); target.hidden = false; }
    });
  });

  // elements
  const sold = document.getElementById('sold');
  const pending = document.getElementById('pending');
  const cleared = document.getElementById('cleared');
  const revenueOut = document.getElementById('revenue');

  const pipeFee = document.getElementById('pipeFee');
  const shareFee = document.getElementById('shareFee');
  const otherFee = document.getElementById('otherFee');
  const saveFee = document.getElementById('saveFee');
  const expenseOut = document.getElementById('expense');

  const balanceOut = document.getElementById('balance');
  const form = document.getElementById('salesForm');
  const msg = document.getElementById('msg');
  const dateInput = document.getElementById('date');

  // auto set today
  dateInput.value = new Date().toISOString().substr(0,10);

  const pricePerBottle = 40;

  function calcRevenue(){
    const rev = (Number(sold.value) + Number(cleared.value) - Number(pending.value)) * pricePerBottle;
    revenueOut.textContent = rev.toLocaleString();
    return rev;
  }

  function calcExpense(){
    const exp = Number(pipeFee.value) + Number(shareFee.value) + Number(otherFee.value) + Number(saveFee.value);
    expenseOut.textContent = exp.toLocaleString();
    return exp;
  }

  function calcBalance(){
    const bal = calcRevenue() - calcExpense();
    balanceOut.textContent = bal.toLocaleString();
    return bal;
  }

  // bind events
  [sold, pending, cleared].forEach(e => e.addEventListener('input', calcRevenue));
  [pipeFee, shareFee, otherFee, saveFee].forEach(e => e.addEventListener('input', calcExpense));
  [sold, pending, cleared, pipeFee, shareFee, otherFee, saveFee].forEach(e => e.addEventListener('input', calcBalance));

  // submit handler
  form.addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    msg.className = 'msg-box loading';
    msg.textContent = '⏳ กำลังบันทึกข้อมูล...';

    const d = dateInput.value;
    if (!d){
      msg.className = 'msg-box error';
      msg.textContent = '❌ โปรดเลือกวันที่';
      return;
    }

    const payload = {
      date: d,
      sold: Number(sold.value) || 0,
      pending: Number(pending.value) || 0,
      cleared: Number(cleared.value) || 0,
      revenue: calcRevenue(),
      pipeFee: Number(pipeFee.value) || 0,
      shareFee: Number(shareFee.value) || 0,
      otherFee: Number(otherFee.value) || 0,
      saveFee: Number(saveFee.value) || 0,
      expense: calcExpense(),
      balance: calcBalance(),
      sheetId: SHEET_ID,
      createdAt: new Date().toISOString()
    };

    try {
      // ส่งข้อมูลแบบ POST (JSON)
      // หมายเหตุ: หาก deploy Apps Script ให้รับ method POST และตั้งเป็น "Anyone, even anonymous" หรือจัดการ OAuth ให้ถูกต้อง
      const resp = await fetch(WEBAPP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      // Apps Script จะคืน JSON หากตั้งค่าไว้
      const data = await resp.json().catch(()=>({status:'ok'}));
      msg.className = 'msg-box success';
      msg.textContent = '✅ บันทึกข้อมูลเรียบร้อยแล้ว';
      form.reset();
      dateInput.value = new Date().toISOString().substr(0,10);
      calcRevenue(); calcExpense(); calcBalance();
    } catch (err){
      console.error('Send error', err);
      msg.className = 'msg-box error';
      msg.textContent = '❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล (ตรวจสอบ WebApp URL และสิทธิ์การเข้าถึง)';
    }
  });

  // open sheet button(s)
  const openSheetBtn = document.getElementById('openSheetBtn');
  const openSheetBtn2 = document.getElementById('openSheetBtn2');
  function openSheet(){
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}`;
    window.open(url, '_blank');
  }
  if (openSheetBtn) openSheetBtn.addEventListener('click', openSheet);
  if (openSheetBtn2) openSheetBtn2.addEventListener('click', openSheet);

  // copy webhook url
  const copyUrlBtn = document.getElementById('copyUrlBtn');
  if (copyUrlBtn){
    copyUrlBtn.addEventListener('click', ()=>{
      navigator.clipboard.writeText(WEBAPP_URL).then(()=>{
        alert('คัดลอก URL Webhook สำเร็จ');
      }).catch(()=>alert('ไม่สามารถคัดลอกได้'));
    });
  }

  // initial calculations
  calcRevenue(); calcExpense(); calcBalance();

  // Material calculator (reuse logic จากที่คุณให้)
  const leafInput = document.getElementById('leafInput');
  const waterInput = document.getElementById('waterInput');
  const yieldInput = document.getElementById('yieldInput');
  const calculateButton = document.getElementById('calculateButton');
  const resetButton = document.getElementById('resetButton');
  const resultContainer = document.getElementById('resultContainer');

  const resultGroundLeaf = document.getElementById('resultGroundLeaf');
  const resultGroundWater = document.getElementById('resultGroundWater');
  const resultGroundYield = document.getElementById('resultGroundYield');

  const resultNotGroundLeaf1 = document.getElementById('resultNotGroundLeaf1');
  const resultNotGroundWater1 = document.getElementById('resultNotGroundWater1');
  const resultNotGroundYield1 = document.getElementById('resultNotGroundYield1');

  const resultNotGroundLeaf2 = document.getElementById('resultNotGroundLeaf2');
  const resultNotGroundWater2 = document.getElementById('resultNotGroundWater2');
  const resultNotGroundYield2 = document.getElementById('resultNotGroundYield2');

  calculateButton.addEventListener('click', ()=>{
    const leaf = parseFloat(leafInput.value) || 0;
    const water = parseFloat(waterInput.value) || 0;
    const yieldDesired = parseFloat(yieldInput.value) || 0;

    if (leaf < 0 || water < 0 || yieldDesired < 0) {
      alert('⚠️ กรุณากรอกค่าที่เป็นบวกเท่านั้น!');
      return;
    }

    let groundLeaf = 0, groundWater = 0, groundYield = 0;
    let notGroundLeaf1 = 0, notGroundWater1 = 0, notGroundYield1 = 0;
    let notGroundLeaf2 = 0, notGroundWater2 = 0, notGroundYield2 = 0;

    const groundRatioLeafToWater = 20;
    const groundRatioWaterToYield = 15/20;

    const notGroundRatioLeafToWater1 = 15.38;
    const notGroundRatioWaterToYield1 = 12/15.38;

    const notGroundRatioLeafToWater2 = 15.87302;
    const notGroundRatioWaterToYield2 = 12/15.87302;

    if (leaf > 0) {
      groundLeaf = leaf;
      groundWater = leaf * groundRatioLeafToWater;
      groundYield = groundWater * groundRatioWaterToYield;

      notGroundLeaf1 = leaf;
      notGroundWater1 = leaf * notGroundRatioLeafToWater1;
      notGroundYield1 = notGroundWater1 * notGroundRatioWaterToYield1;

      notGroundLeaf2 = leaf;
      notGroundWater2 = leaf * notGroundRatioLeafToWater2;
      notGroundYield2 = notGroundWater2 * notGroundRatioWaterToYield2;

    } else if (water > 0) {
      groundWater = water;
      groundLeaf = water / groundRatioLeafToWater;
      groundYield = water * groundRatioWaterToYield;

      notGroundWater1 = water;
      notGroundLeaf1 = water / notGroundRatioLeafToWater1;
      notGroundYield1 = water * notGroundRatioWaterToYield1;

      notGroundWater2 = water;
      notGroundLeaf2 = water / notGroundRatioLeafToWater2;
      notGroundYield2 = water * notGroundRatioWaterToYield2;

    } else if (yieldDesired > 0) {
      groundYield = yieldDesired;
      groundWater = yieldDesired / groundRatioWaterToYield;
      groundLeaf = groundWater / groundRatioLeafToWater;

      notGroundYield1 = yieldDesired;
      notGroundWater1 = yieldDesired / notGroundRatioWaterToYield1;
      notGroundLeaf1 = notGroundWater1 / notGroundRatioLeafToWater1;

      notGroundYield2 = yieldDesired;
      notGroundWater2 = yieldDesired / notGroundRatioWaterToYield2;
      notGroundLeaf2 = notGroundWater2 / notGroundRatioLeafToWater2;

    } else {
      alert('⚠️ กรุณากรอกค่าข้อมูลอย่างน้อยหนึ่งช่อง!');
      return;
    }

    resultGroundLeaf.textContent = groundLeaf.toFixed(2);
    resultGroundWater.textContent = groundWater.toFixed(2);
    resultGroundYield.textContent = groundYield.toFixed(2);

    resultNotGroundLeaf1.textContent = notGroundLeaf1.toFixed(2);
    resultNotGroundWater1.textContent = notGroundWater1.toFixed(2);
    resultNotGroundYield1.textContent = notGroundYield1.toFixed(2);

    resultNotGroundLeaf2.textContent = notGroundLeaf2.toFixed(2);
    resultNotGroundWater2.textContent = notGroundWater2.toFixed(2);
    resultNotGroundYield2.textContent = notGroundYield2.toFixed(2);

    resultContainer.style.display = 'block';
  });

  resetButton.addEventListener('click', ()=>{
    leafInput.value = '';
    waterInput.value = '';
    yieldInput.value = '';
    resultContainer.style.display = 'none';
  });

  // PWA: register service worker
  if ('serviceWorker' in navigator){
    navigator.serviceWorker.register('service-worker.js').then(reg=>{
      console.log('SW registered', reg);
    }).catch(err=>{
      console.warn('SW register failed', err);
    });
  }
}); // DOMContentLoaded
