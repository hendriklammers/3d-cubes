import './styles.css'
import * as THREE from 'three'

let camera
let scene
let renderer
let cubes = []
let isPaused = false
let windowWidth = window.innerWidth
let windowHeight = window.innerHeight

function initScene() {
  const container = document.querySelector('#container')

  scene = new THREE.Scene()

  camera = new THREE.OrthographicCamera(
    windowWidth / -2,
    windowWidth / 2,
    windowHeight / 2,
    windowHeight / -2,
    1,
    2000
  )
  camera.position.z = -500
  camera.updateProjectionMatrix()
  camera.lookAt(scene.position)
  scene.add(camera)

  renderer = new THREE.WebGLRenderer()
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
  console.log('numCubesX', numCubesX)
  console.log('numCubesY', numCubesY)
  for (let x = 0; x < numCubesX; x++) {
    for (let y = 0; y < numCubesY; y++) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize),
        new THREE.MeshNormalMaterial()
      )
      const offsetX = y % 2 === 0 ? spaceX / 2 : 0
      mesh.position.x = (x + 0.5 - numCubesX / 2) * spaceX + offsetX
      mesh.position.y = (y + 0.5 - numCubesY / 2) * spaceY
      mesh.rotation.y = THREE.Math.DEG2RAD * 45
      mesh.rotation.x = THREE.Math.DEG2RAD * 45
      cubes.push(mesh)
      scene.add(mesh)
    }
  }
  return cubes
}

function render() {
  if (!isPaused) {
    cubes.forEach(cube => {
      if (cube.userData.animate) {
        cube.rotation.x += 0.01
        cube.rotation.y += 0.01
      }
    })
    renderer.render(scene, camera)
  }
  requestAnimationFrame(render)
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
  if (isPaused) {
    renderer.render(scene, camera)
  }
}

function handleKeyup(event) {
  if (event.keyCode === 32) {
    isPaused = !isPaused
  }
}

function handleMouseClick(event) {
  event.preventDefault()
  const mouse = new THREE.Vector2()
  // Make sure same coordinate system as camera is used
  mouse.x = event.clientX / windowWidth * 2 - 1
  mouse.y = -(event.clientY / windowHeight) * 2 + 1

  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(scene.children)
  intersects.forEach(({ object }) => {
    object.userData.animate = true
  })
}

function initListeners() {
  window.addEventListener('resize', handleWindowResize)
  document.addEventListener('keyup', handleKeyup)
  document.addEventListener('click', handleMouseClick)
}

function main() {
  initScene()
  initListeners()
  render()
}

main()
