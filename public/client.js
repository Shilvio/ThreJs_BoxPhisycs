
import * as THREE from 'three'
import { OrbitControls } from './jsm/controls/OrbitControls.js'
import * as CANNON from 'cannon-es'
import Stats from './jsm/libs/stats.module.js'
import { GUI } from './jsm/libs/lil-gui.module.min.js'
import { AxesHelper, DirectionalLightHelper } from 'three'

//cannon world
const world = new CANNON.World({
    gravity : new CANNON.Vec3(0,-9.81,0)
})

const timeStep = 1/60


//scene
const scene = new THREE.Scene()

//camera
const camera = new THREE.PerspectiveCamera(
    75, 
    window.innerWidth / window.innerHeight, 
    0.1, 1000
)
camera.position.z = 4
camera.position.y = 2

const renderer = new THREE.WebGLRenderer()
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)

//axes helper
const axesHelper = new THREE.AxesHelper()


// light and shadow
const aL = new THREE.AmbientLight(0xFFFFFF,0.8)

const dL = new THREE.DirectionalLight(0xFFFFFF,0.7)

dL.position.set(0,2,2)
dL.castShadow = true

const dLHelper = new DirectionalLightHelper(dL, 1)

// plane
const planeGeometry = new THREE.PlaneGeometry(5,5,5,5)
const planeMaterial = new THREE.MeshPhongMaterial({
    color: 0xFFFFFF
})
const plane = new THREE.Mesh(planeGeometry,planeMaterial)
plane.receiveShadow = true
//plane rigid body
const groundBody = new CANNON.Body({
    shape : new CANNON.Plane(),
    type : CANNON.Body.STATIC
})
groundBody.quaternion.setFromEuler(-Math.PI / 2,0,0)


// cube
const cubeGeometry = new THREE.BoxGeometry(1,1,1)
const cubeMaterial = new THREE.MeshPhongMaterial({
    color: 0x9c9c9c,
})

const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
cube.position.y = cube.scale.y / 2
cube.position.x = cube.scale.x / 2
cube.position.z = cube.scale.z / 2
cube.receiveShadow = true
cube.castShadow = true
//cube rigid body
const cubeBody	= new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5)),
    position : new CANNON.Vec3(1,0.5,0)
})
// scene adding and world adding
world.addBody(cubeBody)
world.addBody(groundBody)
scene.add(plane,cube,axesHelper,dL,aL,dLHelper)

window.addEventListener(
    'resize',
    () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        render()
    },
    false
)

const stats = Stats()
document.body.appendChild(stats.dom)

//GUI
var cubeParams = {
    color : cubeMaterial.color.getHex()
}
var dLParams = {
    color : dL.color.getHex()
}
var aLParams = {
    color : aL.color.getHex()
}

const gui = new GUI()
//cube
const cubeFolder = gui.addFolder('cube')
    cubeFolder.add(cubeBody.position, 'x', 0,10),
    cubeFolder.add(cubeBody.position, 'y', 0,10),
    cubeFolder.add(cubeBody.position, 'z', 0,10),
    cubeFolder.add(cubeBody, 'mass', -10,10),
    cubeFolder.add(cubeMaterial, 'wireframe')
    cubeFolder.addColor(cubeParams, 'color').onChange( function() {
        cubeMaterial.color.set(cubeParams.color)
    })
//plane
const planeFolder = gui.addFolder('plane')
    planeFolder.add(plane.scale, 'x', 0,10),
    planeFolder.add(plane.scale, 'y', 0,10),
    planeFolder.add(planeMaterial, 'wireframe')
//camera
const cameraFolder = gui.addFolder('camera')
    cameraFolder.add(camera.position, 'y', 0,10),
    cameraFolder.add(camera.position, 'x', 0,10),
    cameraFolder.add(camera.position, 'z', 0,10)
//lights and shadow
const lightfolder = gui.addFolder('lights')
    lightfolder.add(dL.position, 'y', 0,10).name("position y dl"),
    lightfolder.add(dL.position, 'x', 0,10).name("position x dl"),
    lightfolder.add(dL.position, 'z', 0,10).name("position z dl"),
    lightfolder.add(dL.rotation, 'y', 0,10).name("rotation y dl"),
    lightfolder.add(dL.rotation, 'x', 0,10).name("rotation x dl"),
    lightfolder.add(dL.rotation, 'z', 0,10).name("rotation z dl"),
    lightfolder.add(dL, 'intensity', 0,1).name("intensity dl"),
    lightfolder.add(aL, 'intensity', 0,1).name("intensity al"),
    lightfolder.addColor(aLParams, 'color').onChange( function() {
        aL.color.set(aLParams.color)
    }),
    lightfolder.addColor(dLParams, 'color').onChange( function() {
        dL.color.set(dLParams.color)
    })


    


// animate function
function animate() {
    requestAnimationFrame(animate)
    controls.update()
    render()
    stats.update()
    camera.updateProjectionMatrix();
    world.step(timeStep)
    plane.position.copy(groundBody.position)
    plane.quaternion.copy(groundBody.quaternion)
    cube.position.copy(cubeBody.position)
    cube.quaternion.copy(cubeBody.quaternion)
}

function render() {
    renderer.render(scene, camera, dL, dLHelper)
}

animate()
