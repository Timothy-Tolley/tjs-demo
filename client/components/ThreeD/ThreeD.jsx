import * as THREE from 'three'
// import {connect} from 'react-redux'
import React, {Component} from 'react'
import OrbitControls from 'orbit-controls-es6'

class ThreeD extends Component {
  constructor (props) {
    super(props)
    this.stop = this.stop.bind(this)
    this.start = this.start.bind(this)
    this.animate = this.animate.bind(this)
    this.handleLoad = this.handleLoad.bind(this)
    this.onWindowResize = this.onWindowResize.bind(this)
  }

  componentDidMount () {
    const myCanvas = document.getElementById('myCanvas')

    // cubemap
    const path = './images/'
    const format = '.png'
    const urls = [
      path + 'px' + format, path + 'nx' + format,
      path + 'py' + format, path + 'ny' + format,
      path + 'pz' + format, path + 'nz' + format
    ]
    const reflectionCube = new THREE.CubeTextureLoader().load(urls)
    reflectionCube.format = THREE.RGBFormat
    const refractionCube = new THREE.CubeTextureLoader().load(urls)
    refractionCube.mapping = THREE.CubeRefractionMapping
    refractionCube.format = THREE.RGBFormat

    // scene
    const scene = new THREE.Scene()
    scene.background = reflectionCube
    scene.fog = new THREE.FogExp2(0xCCCFFF, 0.001, 100)

    // camera
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      1,
      5000
    )
    camera.position.z = 15
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    // Object Camera
    const objCam = new THREE.CubeCamera(0.1, 5000, 512)
    objCam.position.set(0, 0, 0)
    scene.add(objCam)

    // renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas: myCanvas,
      preserveDrawingBuffer: true
    })
    renderer.setClearColor('#ffffff')
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.autoClearColor = false

    // model loader
    const loader = new THREE.JSONLoader()
    loader.load('./models/motorcycle.json', this.handleLoad)

    // light1
    const light = new THREE.PointLight(0xffffff, 2.0, 600)
    light.position.y = 50
    light.position.x = -45
    scene.add(light)
    // light2
    const light2 = new THREE.PointLight(0xffffff, 1.0, 600)
    light2.position.y = 50
    light2.position.x = -50
    scene.add(light2)
    // light3
    const light3 = new THREE.PointLight(0xffffff, 1.0, 600)
    light3.position.y = -50
    light3.position.x = -50
    scene.add(light3)
    // ambient Light
    const ambient = new THREE.AmbientLight(0xffffff)
    scene.add(ambient)

    // window resizing
    window.addEventListener('resize', this.onWindowResize, false)

    // regular material
    const regMaterial = new THREE.MeshPhongMaterial({color: '#AA6C39', shininess: 30})
    regMaterial.reflectivity = 20
    // mirror material
    const mirrorMaterial = new THREE.MeshBasicMaterial({envMap: objCam.renderTarget.texture})

    // controls
    this.controls = new OrbitControls(camera)
    this.controls.rotateSpeed = 2
    this.controls.zoomSpeed = 2
    this.controls.autoRotate = true
    this.controls.autoRotateSpeed = 0.3
    this.controls.enableRotate = true
    this.controls.enableZoom = true
    this.controls.enablePan = false
    this.controls.minPolarAngle = Math.PI / 4
    this.controls.maxPolarAngle = Math.PI / 1.5
    this.controls.target.set(0, 0, 0)

    // attachments
    this.scene = scene
    this.camera = camera
    this.loader = loader
    this.objCam = objCam
    this.renderer = renderer
    this.regMaterial = regMaterial
    this.mirrorMaterial = mirrorMaterial

    this.mount.appendChild(this.renderer.domElement)
    this.start()
  }

  onWindowResize (event) {
    const windowHeight = window.innerHeight
    const tanFOV = Math.tan(((Math.PI / 180) * this.camera.fov / 2))
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.fov = (360 / Math.PI) * Math.atan(tanFOV * (window.innerHeight / windowHeight))
    this.camera.updateProjectionMatrix()
    this.camera.lookAt(this.scene.position)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.render(this.scene, this.camera)
  }

  componentWillUnmount () {
    this.stop()
    this.mount.removeChild(this.renderer.domElement)
  }

  handleLoad (geometry, materials) {
    this.mesh = new THREE.Mesh(geometry, this.mirrorMaterial)
    this.scene.add(this.mesh)
  }

  start () {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate)
    }
  }

  stop () {
    cancelAnimationFrame(this.frameId)
  }

  animate () {
    this.controls.update()
    this.renderScene()
    this.frameId = window.requestAnimationFrame(this.animate)
  }

  renderScene () {
    if (this.mesh) {
      this.mesh.visible = false
      this.objCam.updateCubeMap(this.renderer, this.scene)
      this.mesh.visible = true
    }
    this.renderer.render(this.scene, this.camera)
  }

  render () {
    return (
      <div className = 'canvasDiv'
        style={{width: '600px', height: '600px'}}
        ref={(mount) => { this.mount = mount }}
      />
    )
  }
}

export default ThreeD
