import * as React from 'react';
import { render } from 'react-dom';
import DataGrid from './DataGrid';

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			columns: [],
		};
	}

	componentDidMount() {
		this.getData();
		this.getColumns();
	}

	getData = () => {
		const data = [
			{ firstName: 'Jack', status: 'Submitted', age: '14' },
			{ firstName: 'Simon', status: 'Pending', age: '15' },
			{ firstName: 'Pete', status: 'Approved', age: '17' },
		];
		this.setState({ data });
	};

	getColumns = () => {
		const columns = [
			{
				Header: 'First Name',
				accessor: 'firstName',
			},
			{
				Header: 'Status',
				accessor: 'status',
			},
			{
				Header: 'Age',
				accessor: 'age',
			},
		];
		this.setState({ columns });
	};

	onClickRow = (rowInfo) => {
		this.setState({ allData: rowInfo }, () => {
			//console.log(this.state.allData);
		});
	};

	render() {
		return (
			<>
				<DataGrid
					data={this.state.data}
					columns={this.state.columns}
					rowClicked={this.onClickRow}
				/>
			</>
		);
	}
}

render(<App />, document.getElementById('root'));
