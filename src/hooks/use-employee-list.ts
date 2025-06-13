
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useEmployeeList() {
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const handleViewProfile = (profileId: string) => {
    navigate(`/employee/profile/${profileId}`);
  };

  const handleSendEmail = (profile: any) => {
    setSelectedProfile(profile);
    setIsEmailModalOpen(true);
  };

  const handleCloseEmailModal = () => {
    setIsEmailModalOpen(false);
    setSelectedProfile(null);
  };

  return {
    selectedProfile,
    isEmailModalOpen,
    handleViewProfile,
    handleSendEmail,
    handleCloseEmailModal
  };
}
