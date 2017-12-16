import './styles.css'
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  Mesh,
  MeshNormalMaterial,
  BoxGeometry,
  Vector3,
  Raycaster,
  Math as ThreeMath,
} from 'three'
import { TweenMax, TimelineMax, Sine } from 'gsap'

let camera
let scene
let renderer
let cubes = []
let windowWidth = window.innerWidth
let windowHeight = window.innerHeight
let mousedown = false

function initScene() {
  const container = document.querySelector('#container')

  scene = new Scene()

  camera = new OrthographicCamera(
    windowWidth / -2,
    windowWidth / 2,
    windowHeight / 2,
    windowHeight / -2,
    1,
    2000
  )
  camera.position.z = -1000
  camera.updateProjectionMatrix()
  camera.lookAt(scene.position)
  scene.add(camera)

  renderer = new WebGLRenderer()
  renderer.setSize(windowWidth, windowHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setClearColor(0x111111)
  container.appendChild(renderer.domElement)

  createCubes()
}

function createCubes() {
  const size = Math.floor(windowWidth / 5) * 0.71
  const spaceX = Math.sqrt(size * size + size * size)
  const spaceY = size * 1.2 // Approximation...
  const numCubesY = Math.floor(windowHeight / spaceY) + 2
  cubes = []
  for (let y = 0; y < numCubesY; y++) {
    let numCubesX = Math.ceil(windowWidth / spaceX)
    numCubesX += y % 2 === 0 ? 1 : 0
    for (let x = 0; x < numCubesX; x++) {
      const mesh = new Mesh(
        new BoxGeometry(size, size, size),
        new MeshNormalMaterial()
      )
      mesh.position.x = (x + 0.5 - numCubesX / 2) * spaceX
      mesh.position.y = (y + 0.5 - numCubesY / 2) * spaceY
      mesh.rotation.y = ThreeMath.DEG2RAD * 45
      mesh.rotation.x = ThreeMath.DEG2RAD * 45
      mesh.userData = { x, y, size }
      cubes.push(mesh)
      scene.add(mesh)
    }
  }
}

function handleWindowResize() {
  windowWidth = window.innerWidth
  windowHeight = window.innerHeight
  camera.left = windowWidth / -2
  camera.right = windowWidth / 2
  camera.top = windowHeight / 2
  camera.bottom = windowHeight / -2
  camera.updateProjectionMatrix()
  renderer.setSize(windowWidth, windowHeight)
  // Remove all cubes from scene and create new ones
  cubes.forEach(cube => scene.remove(cube))
  createCubes()
}

function checkActivated(cubes) {
  let count = 0
  let total = 0
  cubes.forEach(cube => {
    total++
    if (cube.userData.activated) {
      count++
    }
  })
  return total === count
}

function animateCube(object) {
  object.userData.animating = true
  const rotation = object.rotation.x + Math.PI * 0.5
  const tl = new TimelineMax({
    onComplete: () => {
      object.userData.animating = false
    },
  })
  tl
    .to(object.scale, 0.2, {
      x: 0.8,
      y: 0.8,
      z: 0.8,
      ease: Sine.easeIn,
    })
    .to(
      object.rotation,
      0.6,
      {
        y: rotation,
        x: rotation,
        ease: Sine.easeInOut,
      },
      0
    )
    .to(
      object.scale,
      0.2,
      {
        x: 1,
        y: 1,
        z: 1,
        ease: Sine.easeOut,
      },
      '-=0.2'
    )
}

function mouseHit(event) {
  const mouse = new Vector3()
  // Make sure same coordinate system as camera is used
  mouse.x = event.clientX / windowWidth * 2 - 1
  mouse.y = -(event.clientY / windowHeight) * 2 + 1

  const raycaster = new Raycaster()
  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(scene.children)
  intersects.forEach(({ object }) => {
    if (!object.userData.activated) {
      animateCube(object)
      object.userData.activated = true
      if (checkActivated(cubes)) {
        console.log('Yay, all cubes rotated!')
      }
    }
  })
}

function handleMouseDown(event) {
  event.preventDefault()
  mousedown = true
  mouseHit(event)
}

function handleMouseUp() {
  mousedown = false
}

function handleMouseMove(event) {
  if (mousedown) {
    mouseHit(event)
  }
}

function render() {
  renderer.render(scene, camera)
}

// Copy & paste from Stackoverflow FTW
function handleTouch(event) {
  const touches = event.changedTouches
  const first = touches[0]
  let type = ''

  switch (event.type) {
    case 'touchstart':
      type = 'mousedown'
      break
    case 'touchmove':
      type = 'mousemove'
      break
    case 'touchend':
      type = 'mouseup'
      break
    default:
      return
  }

  const simulatedEvent = document.createEvent('MouseEvent')
  simulatedEvent.initMouseEvent(
    type,
    true,
    true,
    window,
    1,
    first.screenX,
    first.screenY,
    first.clientX,
    first.clientY,
    false,
    false,
    false,
    false,
    0,
    null
  )
  first.target.dispatchEvent(simulatedEvent)
}

function initListeners() {
  window.addEventListener('resize', handleWindowResize)
  document.addEventListener('mousedown', handleMouseDown)
  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('touchstart', handleTouch)
  document.addEventListener('touchend', handleTouch)
  document.addEventListener('touchmove', handleTouch)
  TweenMax.ticker.addEventListener('tick', render)
}

function main() {
  initScene()
  initListeners()
}

main()
