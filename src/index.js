import './styles.css'
import {
  Scene,
  OrthographicCamera,
  WebGLRenderer,
  Mesh,
  MeshNormalMaterial,
  BoxGeometry,
  Vector2,
  Vector3,
  Raycaster,
  Math as ThreeMath,
} from 'three'

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
  const numCubesX = Math.ceil(windowWidth / cubeSize)
  const numCubesY = Math.ceil(windowHeight / cubeSize)
  for (let x = 0; x < numCubesX; x++) {
    for (let y = 0; y < numCubesY; y++) {
      const mesh = new Mesh(
        new BoxGeometry(cubeSize, cubeSize, cubeSize),
        new MeshNormalMaterial()
      )
      const offsetX = y % 2 === 0 ? spaceX / 2 : 0
      mesh.position.x = (x + 0.5 - numCubesX / 2) * spaceX + offsetX
      mesh.position.y = (y + 0.5 - numCubesY / 2) * spaceY
      mesh.rotation.y = ThreeMath.DEG2RAD * 45
      mesh.rotation.x = ThreeMath.DEG2RAD * 45
      cubes.push(mesh)
      scene.add(mesh)
    }
  }
  return cubes
}

function render() {
  requestAnimationFrame(render)
  cubes.forEach(cube => {
    if (cube.userData.animate) {
      cube.position.add(new Vector3(0, 1, 1))
    }
  })
  renderer.render(scene, camera)
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
}

function handleMouseDown(event) {
  event.preventDefault()
  const mouse = new Vector2()
  // Make sure same coordinate system as camera is used
  mouse.x = event.clientX / windowWidth * 2 - 1
  mouse.y = -(event.clientY / windowHeight) * 2 + 1

  const raycaster = new Raycaster()
  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(scene.children)
  intersects.forEach(({ object }) => {
    object.userData.animate = true
  })
}

function initListeners() {
  window.addEventListener('resize', handleWindowResize)
  document.addEventListener('mousedown', handleMouseDown)
}

function main() {
  initScene()
  initListeners()
  render()
}

main()
