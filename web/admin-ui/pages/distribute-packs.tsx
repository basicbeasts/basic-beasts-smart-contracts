import DistributePacksOverview from '@components/ui/DistributePacksOverview';
import type { NextPage } from 'next';
import styled from 'styled-components';

import styles from '../styles/Home.module.css';

const DistributePacks: NextPage = () => {
	return (
		<div className={styles.container}>
			<DistributePacksOverview />
		</div>
	);
};

export default DistributePacks;
