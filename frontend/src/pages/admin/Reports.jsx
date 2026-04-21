
import PageHeader from '../../components/PageHeader'

const Reports = () => {
  return (
    <div>
      <PageHeader title="Reports" subtitle="View and generate reports"/>
      <div>
        <select>
          <option value="">Select Report Type</option>
          <option value="placements">Placements Report</option>
          <option value="evaluations">Evaluations Report</option>
          <option value="students">Students Report</option>
        </select>
        <button>Generate Report</button>
      </div>
    </div>
  )
}

export default Reports
