const StatCard = ({ title, value, icon }) => {
  return (
    <div>
      <div>{icon}</div>
      <div>
        <h3>{title}</h3>
        <p>{value}</p>
      </div>
    </div>
  )
}

export default StatCard