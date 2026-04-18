
import PageHeader from '../../components/PageHeader'
import StatCard from '../../components/StatCard'

const Dashboard = () => {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome to the admin panel"
      />
      <div>
        <StatCard title="Total Students" value="0" />
        <StatCard title="Active Placements" value="0" />
        <StatCard title="Evaluations" value="0" />
        <StatCard title="Users" value="0" />
      </div>
    </div>
  )
}

export default Dashboard
