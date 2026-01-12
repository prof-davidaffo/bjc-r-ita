(function () {
  const params = new URLSearchParams(location.search);
  const topic = params.get('topic');
  console.log('[debug] location.pathname', location.pathname);
  console.log('[debug] topic param', topic);
  console.log('[debug] isTopicFile', window.llab && llab.isTopicFile && llab.isTopicFile());
  console.log('[debug] isCurriculum', window.llab && llab.isCurriculum && llab.isCurriculum());
  console.log('[debug] pageLang', window.llab && llab.pageLang && llab.pageLang());
  if (topic) {
    const url = (window.llab && llab.topics_path ? llab.topics_path : '/bjc-r-ita/topic/') + topic;
    console.log('[debug] fetch topic', url);
    fetch(url).then(r => { console.log('[debug] topic status', r.status); return r.text(); })
      .then(t => console.log('[debug] topic length', t.length))
      .catch(err => console.warn('[debug] topic fetch error', err));
  }
})();
