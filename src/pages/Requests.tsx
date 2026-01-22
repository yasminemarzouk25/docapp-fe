import { useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';

// Redirect to My Requests by default
const Requests: FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/app/requests/my', { replace: true });
  }, [navigate]);

  return null;
};

export default Requests;
