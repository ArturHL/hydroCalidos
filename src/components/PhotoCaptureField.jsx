import { useEffect, useRef, useState } from 'react'
import { IconCamera, IconCheck, IconRefresh, IconX } from '@tabler/icons-react'

const MAX_DIM = 900
const JPEG_QUALITY = 0.65

function capturarFrame(video) {
  const { videoWidth: w, videoHeight: h } = video
  const escala = Math.min(1, MAX_DIM / Math.max(w, h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(w * escala)
  canvas.height = Math.round(h * escala)
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}

// Cámara propia dentro de la página — nunca abre la app de cámara del
// sistema ni el carrete/galería del celular: la vista previa vive en un
// <video> de la propia app y la captura se recorta con <canvas>, todo en
// memoria (data URL), sin tocar el almacenamiento de fotos del dispositivo.
// La cámara trasera se exige explícitamente (facingMode "exact") — si el
// dispositivo no tiene una, falla con un error claro en vez de usar la
// frontal en silencio.
function CameraModal({ titulo, onCapturar, onCerrar }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [estado, setEstado] = useState('iniciando') // iniciando | listo | error | revisando
  const [fotoTmp, setFotoTmp] = useState(null)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    let cancelado = false

    async function iniciar() {
      setEstado('iniciando')
      if (!navigator.mediaDevices?.getUserMedia) {
        setEstado('error')
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { exact: 'environment' } },
          audio: false,
        })
        if (cancelado) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        setEstado('listo')
      } catch {
        if (!cancelado) setEstado('error')
      }
    }

    iniciar()
    return () => {
      cancelado = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [intento])

  function capturar() {
    if (!videoRef.current) return
    setFotoTmp(capturarFrame(videoRef.current))
    setEstado('revisando')
  }

  function retomar() {
    setFotoTmp(null)
    setEstado('listo')
  }

  function usarFoto() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    onCapturar(fotoTmp)
  }

  function cerrar() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    onCerrar()
  }

  return (
    <div className="camera-modal-backdrop" onClick={cerrar}>
      <div className="camera-modal" onClick={(e) => e.stopPropagation()}>
        <div className="camera-modal-head">
          <p>{titulo}</p>
          <button type="button" className="icon-btn-danger" onClick={cerrar}>
            <IconX size={18} stroke={2} />
          </button>
        </div>

        {estado === 'error' && (
          <div className="camera-modal-error">
            <p>
              No se pudo acceder a la cámara trasera. Verifica los permisos de la app o que el
              dispositivo tenga cámara trasera.
            </p>
            <button type="button" className="btn-secondary" onClick={() => setIntento((n) => n + 1)}>
              <IconRefresh size={16} stroke={2} />
              Reintentar
            </button>
          </div>
        )}

        {(estado === 'iniciando' || estado === 'listo') && (
          <>
            <video ref={videoRef} className="camera-preview" playsInline muted />
            {estado === 'listo' && (
              <button type="button" className="btn-primary camera-capture-btn" onClick={capturar}>
                <IconCamera size={18} stroke={2} />
                Capturar
              </button>
            )}
          </>
        )}

        {estado === 'revisando' && fotoTmp && (
          <>
            <img src={fotoTmp} className="camera-preview" alt="Vista previa de la foto" />
            <div className="ticket-actions">
              <button type="button" className="btn-primary" onClick={usarFoto}>
                <IconCheck size={16} stroke={2} />
                Usar foto
              </button>
              <button type="button" className="btn-secondary" onClick={retomar}>
                <IconRefresh size={16} stroke={2} />
                Volver a tomar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Campo de formulario para una foto requerida — botón "Tomar foto" abre la
// cámara propia (CameraModal). Una vez capturada, muestra una miniatura y
// permite repetirla; nunca hay opción de "elegir de la galería".
function PhotoCaptureField({ label, value, onCapture }) {
  const [abierta, setAbierta] = useState(false)

  return (
    <div className="photo-field">
      <p className="photo-field-label">{label}</p>

      {value ? (
        <div className="photo-field-preview">
          <img src={value} alt={label} />
          <button type="button" className="btn-secondary" onClick={() => setAbierta(true)}>
            <IconRefresh size={16} stroke={2} />
            Volver a tomar
          </button>
        </div>
      ) : (
        <button type="button" className="btn-secondary" onClick={() => setAbierta(true)}>
          <IconCamera size={16} stroke={2} />
          Tomar foto
        </button>
      )}

      {abierta && (
        <CameraModal
          titulo={label}
          onCapturar={(foto) => {
            onCapture(foto)
            setAbierta(false)
          }}
          onCerrar={() => setAbierta(false)}
        />
      )}
    </div>
  )
}

export default PhotoCaptureField
