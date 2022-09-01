import React,{ useState, useEffect} from 'react'
import UserProfile from '../../src/Components/User/userProfile'
import Sidebar from '../../src/Components/User/userSidebar'
import { Container, Row, Col} from 'react-bootstrap';
import {authInitialProps} from '../../lib/auth';
import { useRouter } from "next/router";
import Loader from '../../src/Components/PageComponent/Loader';

const Profile = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    useEffect(() => {
        let isAuthenticated = authInitialProps(true);
        if(!isAuthenticated){
            router.push("/login");
        } else {
            setIsAuthenticated(true);
        }
    }, []);
    return (
        <Container>
            {!isAuthenticated && <Loader animation="grow" color="secondary"/>}
            <Row>
                <Col md={4}><Sidebar/></Col>
                <Col md={8}><UserProfile/></Col>
            </Row>
        </Container>
    )
}

export default Profile;