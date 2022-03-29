import * as React from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';

export default class DataGrid extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedRows: [],
		};
	}

	rowClick = (state, rowInfo) => {
		if (rowInfo) {
			let selectedRows = new Set();
			return {
				onClick: (e) => {
					if (e.ctrlKey) {
						selectedRows = this.state.selectedRows;
						rowInfo._index = rowInfo.index;
						selectedRows.push(rowInfo);
						this.setState({
							selectedRows,
						});
					} else {
						selectedRows = [];
						rowInfo._index = rowInfo.index;
						selectedRows.push(rowInfo);
					}
					this.setState(
						{
							selectedRows,
						},
						() => {
							console.log(
								'final values',
								this.state.selectedRows
							);
							this.props.rowClicked(this.state.selectedRows);
						}
					);
				},
				style: {
					background:
						this.state.selectedRows.some(
							(e) => e._index === rowInfo.index
						) && '#9bdfff',
				},
			};
		} else {
			return '';
		}
	};

	render() {
		return (
			<ReactTable
				data={this.props.data}
				columns={this.props.columns}
				getTrProps={this.rowClick}
			/>
		);
	}
}
