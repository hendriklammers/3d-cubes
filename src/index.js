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
import { TweenLite, TimelineLite, Sine } from 'gsap'

let camera
let scene
let renderer
let cubes = []
let windowWidth = window.innerWidth
let windowHeight = window.innerHeight

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
  const cubeSize = 100
  const spaceX = Math.sqrt(cubeSize * cubeSize + cubeSize * cubeSize)
  const spaceY = cubeSize * 1.2 // Approximation...
  // TODO: Use bounding box of rotated cube instead of cubesize to calculate
  // number of cubes
  const numCubesX = Math.floor(windowWidth / cubeSize)
  const numCubesY = Math.floor(windowHeight / cubeSize)
  cubes = []
  for (let y = 0; y < numCubesY; y++) {
    cubes.push([])
    for (let x = 0; x < numCubesX; x++) {
      const mesh = new Mesh(
        new BoxGeometry(cubeSize, cubeSize, cubeSize),
        new MeshNormalMaterial()
      )
      const offsetX = y % 2 === 0 ? spaceX / 2 : 0
      mesh.position.x = (x + 0.5 - numCubesX / 2) * spaceX + offsetX
      mesh.position.y = (y + 0.5 - numCubesY / 2) * spaceY
      mesh.rotation.y = ThreeMath.DEG2RAD * 45
      mesh.rotation.x = ThreeMath.DEG2RAD * 45
      cubes[y].push(mesh)
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
  cubes.forEach(row => {
    row.forEach(cube => scene.remove(cube))
  })
  createCubes()
}

function animateCube(object) {
  if (!object.userData.animating) {
    object.userData.animating = true
    const rotation = object.rotation.x + Math.PI * 0.5
    const tl = new TimelineLite({
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
}

function handleMouseDown(event) {
  event.preventDefault()
  const mouse = new Vector3()
  // Make sure same coordinate system as camera is used
  mouse.x = event.clientX / windowWidth * 2 - 1
  mouse.y = -(event.clientY / windowHeight) * 2 + 1

  const raycaster = new Raycaster()
  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(scene.children)
  const cube = intersects[0].object
  console.log(cube)
  animateCube(cube)
}

function render() {
  renderer.render(scene, camera)
}

function initListeners() {
  window.addEventListener('resize', handleWindowResize)
  document.addEventListener('mousedown', handleMouseDown)
  TweenLite.ticker.addEventListener('tick', render)
}

function main() {
  initScene()
  initListeners()
}

main()
