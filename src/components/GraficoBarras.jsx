// Gráfico de barras horizontal, ligero (sin librerías).
// Recibe: datos = [{ etiqueta, valor, color }], y un sufijo opcional (ej. " €").

export default function GraficoBarras({ datos, sufijo = '' }) {
  const max = Math.max(...datos.map((d) => d.valor), 1)

  return (
    <div>
      {datos.map((d) => (
        <div className="barra-fila" key={d.etiqueta}>
          <div className="barra-etiqueta">{d.etiqueta}</div>
          <div className="barra-pista">
            <div
              className="barra-relleno"
              style={{ width: `${(d.valor / max) * 100}%`, background: d.color }}
            />
          </div>
          <div className="barra-valor">
            {d.valor.toLocaleString('es-ES')}{sufijo}
          </div>
        </div>
      ))}
    </div>
  )
}
