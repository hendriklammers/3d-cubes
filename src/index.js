import './styles.css'
import * as THREE from 'three'

let camera
let scene
let renderer
let cubes = []
let isPaused = false

function initScene() {
  const container = document.querySelector('#container')
  const width = window.innerWidth
  const height = window.innerHeight

  scene = new THREE.Scene()

  camera = new THREE.OrthographicCamera(
    width / -2,
    width / 2,
    height / 2,
    height / -2,
    1,
    1000
  )
  camera.position.z = -500
  camera.updateProjectionMatrix()
  camera.lookAt(scene.position)
  scene.add(camera)

  renderer = new THREE.WebGLRenderer()
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setClearColor(0x111111)
  container.appendChild(renderer.domElement)

  createCubes()
}

function createCubes() {
  const cubeSize = 100
  const numCubesX = Math.ceil(window.innerWidth / cubeSize)
  const numCubesY = Math.ceil(window.innerHeight / cubeSize)
  for (let x = 0; x < numCubesX; x++) {
    for (let y = 0; y < numCubesY; y++) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize),
        new THREE.MeshNormalMaterial()
      )
      mesh.position.x = (x + 0.5 - numCubesX / 2) * cubeSize
      mesh.position.y = (y + 0.5 - numCubesY / 2) * cubeSize
      cubes.push(mesh)
      scene.add(mesh)
    }
  }
  return cubes
}

function render() {
  if (!isPaused) {
    cubes.forEach(cube => {
      cube.rotation.x += 0.01
      cube.rotation.y -= 0.01
    })
    renderer.render(scene, camera)
  }
  requestAnimationFrame(render)
}

function handleWindowResize() {
  const width = window.innerWidth
  const height = window.innerHeight
  camera.left = width / -2
  camera.right = width / 2
  camera.top = height / 2
  camera.bottom = height / -2
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  if (isPaused) {
    renderer.render(scene, camera)
  }
}

function handleKeyup(event) {
  if (event.keyCode === 32) {
    isPaused = !isPaused
  }
}

function main() {
  initScene()
  window.addEventListener('resize', handleWindowResize)
  window.addEventListener('keyup', handleKeyup)
  render()
}

main()
