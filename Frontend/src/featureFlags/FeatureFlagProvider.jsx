import { useEffect, useState } from 'react';
import { FeatureFlagContext } from './FeatureFlagContext';
import { fetchFeatureFlags } from '../api/featureFlags';

// Flags come from the backend. If they cannot be fetched, every flag counts as off.
export default function FeatureFlagProvider({ children }) {
  const [flags, setFlags] = useState(null);

  useEffect(() => {
    fetchFeatureFlags()
      .then(setFlags)
      .catch(() => setFlags({}));
  }, []);

  if (flags === null) {
    return null;
  }

  return <FeatureFlagContext.Provider value={flags}>{children}</FeatureFlagContext.Provider>;
}
