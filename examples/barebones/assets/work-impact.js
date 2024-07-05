(function () {
  /**
   * Polyfill for attaching event listeners to elements.
   *
   * @param {HTMLElement} obj Element to which event is attached.
   * @param {string} ev Event name.
   * @param {Function} func Listener.
   * @returns {void}
   * @throws {Error}
   */
  function attachEventPolyfill (obj, ev, func) {
    if (obj.addEventListener) {
      obj.addEventListener(ev, func, false)
    } else if (obj.attachEvent) {
      obj.attachEvent('on' + ev, func)
    } else {
      throw new Error('This browser does not support modern event listeners')
    }
  }

  /**
   * Attach show/hide functionality.
   *
   * @param {HTMLElement} node Element to init.
   * @returns {void}
   */
  function casaV1InitShowHide (node) {
    const fieldName = node.getAttribute('name')
    const initNodes = document.querySelectorAll('[name="' + fieldName + '"]:not([data-target-init-done])')
    const nodeGroup = document.querySelectorAll('[name="' + fieldName + '"]')

    /**
     * Show target.
     *
     * @param {HTMLElement} targetEl Target.
     * @returns {void}
     */
    function showTarget (targetEl) {
      console.log('show', targetEl)
      targetEl.className = targetEl.className.replace(/ *js-hidden/, '')
    }

    /**
     * Hide target.
     *
     * @param {HTMLElement} targetEl Target.
     * @returns {void}
     */
    function hideTarget (targetEl) {
      console.log('hide', targetEl)
      targetEl.className = targetEl.className.replace(/ *js-hidden/, '') + ' js-hidden'
    }

    /**
     * Click node.
     *
     * @returns {void}
     */
    function clickNode () {
      for (let i = 0, l = nodeGroup.length; i < l; i += 1) {
        if (nodeGroup[i].getAttribute('data-target')) {
          const targetEl = document.getElementById(nodeGroup[i].getAttribute('data-target'))
          if (nodeGroup[i].checked) {
            showTarget(targetEl)
          } else {
            hideTarget(targetEl)
          }
        }
      }
    }

    for (let i = 0, l = initNodes.length; i < l; i += 1) {
      attachEventPolyfill(initNodes[i], 'click', clickNode)
      initNodes[i].setAttribute('data-target-init-done', true)
    }

    // Initialise state based on pre-populated inputs
    clickNode()
  }

  document.onreadystatechange = function hReayStateChange () {
    let nodeList
    let i
    let l
    if (document.readyState === 'complete') {
      nodeList = document.querySelectorAll('[data-target]')
      for (i = 0, l = nodeList.length; i < l; i += 1) {
        casaV1InitShowHide(nodeList[i])
      }
    }
  }
})()
