function fitElementToParent(el, padding) {
  var timeout = null;
  function resize() {
    if (timeout) clearTimeout(timeout);
    anime.set(el, { scale: 1 });
    var pad = padding || 0;
    var parentEl = el.parentNode;
    var elOffsetWidth = el.offsetWidth - pad;
    var parentOffsetWidth = parentEl.offsetWidth;
    var ratio = parentOffsetWidth / elOffsetWidth;
    timeout = setTimeout(anime.set(el, { scale: ratio }), 10);
  }
  resize();
  window.addEventListener('resize', resize);
}

var advancedStaggeringAnimation = function () {

  var staggerVisualizerEl = document.querySelector('.stagger-visualizer');
  var grid = [100, 50];
  var cell = 55;
  var numberOfElements = grid[0] * grid[1];
  var animation;
  var paused = true;

  const groupBoundingClientRect = staggerVisualizerEl.getBoundingClientRect();
  const paths = Array.from(staggerVisualizerEl.children);
  const pathsCenter = paths.map(path => {
    const pathBBox = path.getBBox();
    const pathCenter = {
      x: pathBBox.x + pathBBox.width / 2,
      y: pathBBox.y + pathBBox.height / 2 };

    return pathCenter;
  });

  paths.forEach((path, index) => {
    path.style.transformOrigin = `${pathsCenter[index].x}px ${pathsCenter[index].y}px`;
  });

  fitElementToParent(staggerVisualizerEl, 0);

  var index = anime.random(0, numberOfElements - 1);
  var nextIndex = 0;

  anime.set('.stagger-visualizer .cursor', {
    translateZ: 0,
    scale: 1.5 });


  function play() {

    paused = false;
    if (animation) animation.pause();

    nextIndex = anime.random(0, numberOfElements - 1);

    animation = anime.timeline({
      easing: 'easeInOutQuad',
      complete: play }).

    add({
      targets: '.stagger-visualizer .cursor',
      keyframes: [
      { scale: .75, duration: 120 },
      { scale: 2.5, duration: 220 },
      { scale: 1.5, duration: 450 }],

      duration: 300 }).

    add({
      targets: '.stagger-visualizer path',
      keyframes: [
      {
        fill: '#2e7d32',
        scale: anime.stagger([1.8, 1], { grid: grid, from: 'center' }),
        duration: 225 },
      {
        scale: 1,
        duration: 1200 },
      {
        fill: '#333',
        duration: 300 }],


      delay: anime.stagger(80, { grid: grid, from: index }) },
    30).
    add({
      targets: '.stagger-visualizer .cursor',
      scale: 1.5,
      easing: 'cubicBezier(.075, .2, .165, 1)' },
    '-=800');

    index = nextIndex;

  }

  play();

}();