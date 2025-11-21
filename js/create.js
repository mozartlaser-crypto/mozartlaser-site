// js/create.js
// ============================
// CREATE.JS — Clean rewrite for step navigation, validation, and summary generation
// ============================

document.addEventListener('DOMContentLoaded', () => {

  // ---------------------
  // State & helpers
  // ---------------------
  let cartItemsArray = [];
  let currentPrice = 20;

  const $ = (sel) => document.querySelector(sel);

function addToCartVisual(productName, price) {
    if (window.addToCart) {
        window.addToCart(productName, price);
    } else {
        console.warn("cart.js not loaded yet");
    }
}

  // ---------------------
  // Elements
  // ---------------------
  const steps = Array.from(document.querySelectorAll('.step'));
  const modeCustomize = $('#mode-customize');
  const modeFull = $('#mode-full');
  const selectExisting = $('#select-existing');
  const uploadFileInput = $('#upload-file');
  const uploadFileCustom = $('#upload-file-custom');
  const deleteFileBtn = $('#delete-file');
  const deleteFileCustom = $('#delete-file-custom');
  const filePlacementInput = $('#file-placement');
  const filePlacementCustom = $('#file-placement-custom');
  const textField = $('#custom-text');
  const fontSelect = $('#font-select');
  const textLocation = $('#text-location');
  const additionalDesc = $('#additional-desc');
  const customChanges = $('#custom-changes');
  const selectedProductText = $('#selected-product-text');
  const sendForm = $('#sendForm');

  // hidden form fields
  const hiddenFlowType = $('#f-flow-type');
  const hiddenProduct = $('#f-product');
  const hiddenText = $('#f-text');
  const hiddenFont = $('#f-font');
  const hiddenLocation = $('#f-location');
  const hiddenFilePlacement = $('#f-file-placement');
  const hiddenDescription = $('#f-description');
  const hiddenSelectedProduct = $('#f-selected-product');
  const hiddenCustomChanges = $('#f-custom-changes');
  const hiddenCustomFilePlacement = $('#f-custom-file-placement');
  const hiddenPrice = $('#f-price');
  const hiddenEmail = $('#f-email');

  // ---------------------
  // Utility: steps
  // ---------------------
  function showStep(stepId) {
    steps.forEach(s => s.classList.remove('active'));
    const el = document.getElementById(stepId);
    if (el) el.classList.add('active');
    window.scrollTo(0, 0);
  }

  // ---------------------
  // STEP 1: populate dropdown depending on mode
  // (THIS IS SEPARATE FROM CART)
  // ---------------------
  function populateSelectForMode() {
    if (!selectExisting) return;
    if (modeCustomize && modeCustomize.checked) {
      selectExisting.innerHTML = `
        <option value="">-- Choose a Product to Customize --</option>
        <option value="Coin - Dragon">Coin - Dragon</option>
        <option value="Wallet - Minimalist">Wallet - Minimalist</option>
        <option value="Wallet - Leather">Wallet - Leather</option>
        <option value="Plaque - Music">Plaque - Music</option>
      `;
    } else {
      selectExisting.innerHTML = `
        <option value="">-- Select Product Type --</option>
        <option value="Plaque (Horizontal)">Plaque (Horizontal)</option>
        <option value="Plaque (Vertical)">Plaque (Vertical)</option>
        <option value="Coin">Coin</option>
        <option value="Wallet">Wallet</option>
      `;
    }
    updatePrice();
  }

  // ---------------------
  // Price logic
  // ---------------------
  function updatePrice() {
    if (!selectExisting) { currentPrice = 20; return; }

    if (modeCustomize && modeCustomize.checked) {
      currentPrice = 25;
    } else {
      const product = selectExisting.value || '';
      if (product.includes('Plaque')) currentPrice = 40;
      else if (product.includes('Coin')) currentPrice = 25;
      else if (product.includes('Wallet')) currentPrice = 35;
      else currentPrice = 20;
    }

    const step3Price = $('#total-price');
    if (step3Price) step3Price.textContent = `Total: $${currentPrice}`;

    const step3CustomPrice = $('#total-price-custom');
    if (step3CustomPrice) step3CustomPrice.textContent = `Total: $${currentPrice}`;
  }

  // ---------------------
  // File copying helper (for hidden form)
  // ---------------------
  function copyFileIntoHiddenInput(input) {
    if (!sendForm) return;
    const fileField = sendForm.querySelector('input[type="file"]');
    if (!fileField) return;
    if (input && input.files && input.files.length > 0) {
      const dt = new DataTransfer();
      dt.items.add(input.files[0]);
      fileField.files = dt.files;
    } else {
      // clear file input
      try { fileField.value = ''; } catch (e) { /* ignore */ }
    }
  }

  // ---------------------
  // Validation
  // ---------------------
  function validateFullStep2() {
    const text = (textField && textField.value || '').trim();
    const font = (fontSelect && fontSelect.value) || '';
    const desc = (additionalDesc && additionalDesc.value || '').trim();
    const fileInput = uploadFileInput;
    const hasFile = fileInput && fileInput.files && fileInput.files.length > 0;

    if (!text && !hasFile && !desc) {
      alert('Please enter text, upload a file, or add a description.');
      return false;
    }
    if (text && !font) {
      alert('Please select a font for your engraved text.');
      return false;
    }
    if (hasFile && filePlacementInput && !filePlacementInput.value.trim()) {
      alert('Please describe how your uploaded design should be placed.');
      return false;
    }
    return true;
  }

  function validateCustomStep2() {
    const selected = (selectExisting && selectExisting.value) || '';
    const changes = (customChanges && customChanges.value || '').trim();
    const hasFile = uploadFileCustom && uploadFileCustom.files && uploadFileCustom.files.length > 0;
    if (!selected) {
      alert('Please select a product to customize.');
      return false;
    }
    if (!changes && !hasFile) {
      alert('Please describe your changes or upload a design.');
      return false;
    }
    return true;
  }

  // ---------------------
  // Summary generation
  // ---------------------
  function escapeHtml(str) {
    return String(str || '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function populateStep3Summary() {
    const s = $('#summary');
    if (s) {
      const text = (textField && textField.value.trim()) || 'None';
      const font = (fontSelect && fontSelect.value) || 'None';
      const textLoc = (textLocation && textLocation.value.trim()) || 'None';
      const fileName = (uploadFileInput && uploadFileInput.files && uploadFileInput.files.length > 0)
        ? uploadFileInput.files[0].name
        : 'None';
      const desc = (additionalDesc && additionalDesc.value.trim()) || 'None';

      s.innerHTML = `
        <p><strong>Engraved Text:</strong> ${escapeHtml(text)}</p>
        <p><strong>Font:</strong> ${escapeHtml(font)}</p>
        <p><strong>Text Placement:</strong> ${escapeHtml(textLoc)}</p>
        <p><strong>Uploaded File:</strong> ${escapeHtml(fileName)}</p>
        <p><strong>Additional Description:</strong> ${escapeHtml(desc)}</p>
        <p><strong>Price:</strong> $${currentPrice}</p>
      `;
    }

    const sc = $('#summary_custom');
    if (sc) {
      const selected = (selectExisting && selectExisting.value) || 'None';
      const changes = (customChanges && customChanges.value.trim()) || 'None';
      const fileNameCustom = (uploadFileCustom && uploadFileCustom.files && uploadFileCustom.files.length > 0)
        ? uploadFileCustom.files[0].name
        : 'None';
      const placementCustom = (filePlacementCustom && filePlacementCustom.value.trim()) || 'None';

      sc.innerHTML = `
        <p><strong>Selected Product:</strong> ${escapeHtml(selected)}</p>
        <p><strong>Requested Changes:</strong> ${escapeHtml(changes)}</p>
        <p><strong>Uploaded File:</strong> ${escapeHtml(fileNameCustom)}</p>
        <p><strong>File Placement:</strong> ${escapeHtml(placementCustom)}</p>
        <p><strong>Price:</strong> $${currentPrice}</p>
      `;
    }
  }

  // ---------------------
  // Step navigation (delegated handling)
  // ---------------------
  function handleNext(nextId) {
    if (nextId === 'step3') {
      if (!validateFullStep2()) return;
      populateStep3Summary();
      showStep('step3');
      return;
    }
    if (nextId === 'step3_custom') {
      if (!validateCustomStep2()) return;
      populateStep3Summary();
      showStep('step3_custom');
      return;
    }
    if (nextId) showStep(nextId);
  }

  function handlePrev(prevId) {
    if (prevId) showStep(prevId);
  }

  document.addEventListener('click', (ev) => {
    const btn = ev.target.closest && ev.target.closest('.next-step, .prev-step');
    if (!btn) return;
    ev.preventDefault();

    if (btn.classList.contains('next-step')) {
      if (btn.id === 'step1-next') {
        if (!selectExisting) {
          alert('Missing product selector.');
          return;
        }
        if (modeCustomize && modeCustomize.checked) {
          if (!selectExisting.value) {
            alert('Please select a product to customize.');
            return;
          }
          if (hiddenSelectedProduct) hiddenSelectedProduct.value = selectExisting.value;
          if (selectedProductText) selectedProductText.textContent = selectExisting.value;
          updatePrice();
          showStep('step2_custom');
          return;
        } else {
          updatePrice();
          showStep('step2');
          return;
        }
      }

      const nextId = btn.getAttribute('data-next');
      handleNext(nextId);
      return;
    }

    if (btn.classList.contains('prev-step')) {
      const prevId = btn.getAttribute('data-prev');
      handlePrev(prevId);
    }
  });

  // ---------------------
  // File delete buttons
  // ---------------------
  if (deleteFileBtn && uploadFileInput) {
    deleteFileBtn.addEventListener('click', () => {
      uploadFileInput.value = '';
    });
  }
  if (deleteFileCustom && uploadFileCustom) {
    deleteFileCustom.addEventListener('click', () => {
      uploadFileCustom.value = '';
    });
  }

  // ---------------------
  // Mode toggles & select change
  // ---------------------
  if (modeCustomize) modeCustomize.addEventListener('change', populateSelectForMode);
  if (modeFull) modeFull.addEventListener('change', populateSelectForMode);

  if (selectExisting) {
    selectExisting.addEventListener('change', () => {
      updatePrice();
      if (selectedProductText) selectedProductText.textContent = selectExisting.value || 'None';
    });
  }

  // ---------------------
  // Add to cart handlers (full & custom flows)
  // Important: add to cart (storage + render) happens BEFORE sending the hidden form.
  // ---------------------
  const addToCartBtn = $('#add-to-cart');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const name = ($('#verify-name') && $('#verify-name').value.trim()) || '';
      const email = ($('#verify-email') && $('#verify-email').value.trim()) || '';
      if (!name || !email) return alert('Please enter your name and email.');

      const productName = selectExisting ? selectExisting.value || 'Custom Product' : 'Custom Product';
      const priceAtClick = currentPrice;

      // Add to cart (persisted)
      addToCartVisual(productName, priceAtClick);

      // populate hidden form fields
      if (hiddenFlowType) hiddenFlowType.value = 'create-your-own';
      if (hiddenProduct) hiddenProduct.value = selectExisting ? selectExisting.value : '';
      if (hiddenText) hiddenText.value = textField ? textField.value : '';
      if (hiddenFont) hiddenFont.value = fontSelect ? fontSelect.value : '';
      if (hiddenLocation) hiddenLocation.value = textLocation ? textLocation.value : '';
      if (hiddenFilePlacement) hiddenFilePlacement.value = filePlacementInput ? filePlacementInput.value : '';
      if (hiddenDescription) hiddenDescription.value = additionalDesc ? additionalDesc.value : '';
      if (hiddenPrice) hiddenPrice.value = `$${priceAtClick}`;
      if (hiddenEmail) hiddenEmail.value = email;

      copyFileIntoHiddenInput(uploadFileInput || null);

      // submit silently to backend (if desired)
      if (sendForm) {
        try { sendForm.submit(); } catch (e) { console.warn('Form submit failed', e); }
      }

      alert('Your custom product has been added to the Cart!');
      showStep('step1');
    });
  }

  const addToCartCustomBtn = $('#add-to-cart-custom');
  if (addToCartCustomBtn) {
    addToCartCustomBtn.addEventListener('click', () => {
      const name = ($('#verify-name-custom') && $('#verify-name-custom').value.trim()) || '';
      const email = ($('#verify-email-custom') && $('#verify-email-custom').value.trim()) || '';
      if (!name || !email) return alert('Please enter your name and email.');

      const productName = selectExisting ? selectExisting.value || 'Custom Product' : 'Custom Product';
      const priceAtClick = currentPrice;

      // Add to cart (persisted)
      addToCartVisual(productName, priceAtClick);

      // hidden fields
      if (hiddenFlowType) hiddenFlowType.value = 'customize';
      if (hiddenSelectedProduct) hiddenSelectedProduct.value = selectExisting ? selectExisting.value : '';
      if (hiddenCustomChanges) hiddenCustomChanges.value = customChanges ? customChanges.value : '';
      if (hiddenCustomFilePlacement) hiddenCustomFilePlacement.value = filePlacementCustom ? filePlacementCustom.value : '';
      if (hiddenPrice) hiddenPrice.value = `$${priceAtClick}`;
      if (hiddenEmail) hiddenEmail.value = email;

      copyFileIntoHiddenInput(uploadFileCustom || null);

      if (sendForm) {
        try { sendForm.submit(); } catch (e) { console.warn('Form submit failed', e); }
      }

      alert('Your customization has been added to the Cart!');
      showStep('step1');
    });
  }

  // ---------------------
  // Font dropdown helper (unchanged logic, but safe)
  // ---------------------
  function createFontDropdown() {
    if (!fontSelect) return;
    try {
      const select = fontSelect;
      const container = document.createElement('div');
      container.classList.add('custom-select');
      select.style.display = 'none';

      const selectedDiv = document.createElement('div');
      selectedDiv.classList.add('select-selected');
      selectedDiv.textContent = select.options[select.selectedIndex]?.text || 'Choose a font';
      container.appendChild(selectedDiv);

      const optionsDiv = document.createElement('div');
      optionsDiv.classList.add('select-items', 'select-hide');

      for (let i = 0; i < select.options.length; i++) {
        const option = select.options[i];
        const optionDiv = document.createElement('div');
        optionDiv.textContent = option.text;
        optionDiv.style.fontFamily = option.value ? (option.value.includes(' ') ? `'${option.value}'` : option.value) : '';
        if (!option.value) optionDiv.style.color = '#999';

        optionDiv.addEventListener('click', function () {
          select.selectedIndex = i;
          select.value = option.value;
          select.dispatchEvent(new Event('change'));
          selectedDiv.textContent = option.text;
          selectedDiv.style.fontFamily = option.value ? optionDiv.style.fontFamily : '';
          closeAllSelect();
        });

        optionsDiv.appendChild(optionDiv);
      }

      container.appendChild(optionsDiv);
      select.parentNode.insertBefore(container, select.nextSibling);

      selectedDiv.addEventListener('click', function (e) {
        e.stopPropagation();
        closeAllSelect(this);
        optionsDiv.classList.toggle('select-hide');
        this.classList.toggle('select-arrow-active');
      });

      function closeAllSelect(except) {
        document.querySelectorAll('.select-items').forEach(el => {
          if (el.previousSibling !== except) el.classList.add('select-hide');
        });
        document.querySelectorAll('.select-selected').forEach(el => {
          if (el !== except) el.classList.remove('select-arrow-active');
        });
      }

      document.addEventListener('click', closeAllSelect);
    } catch (err) {
      console.warn('Font dropdown init failed:', err);
    }
  }
  createFontDropdown();

  if (fontSelect) {
    for (let opt of fontSelect.options) {
      if (opt.value) opt.style.fontFamily = opt.value.includes(' ') ? `'${opt.value}'` : opt.value;
    }
  }

  // ---------------------
  // Startup: load cart, populate UI, show step 1
  // ---------------------
  
  populateSelectForMode();
  updatePrice();
  showStep('step1');

});