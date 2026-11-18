import { useContext } from 'react';
import { FeatureFlagContext } from './FeatureFlagContext';

export default function useFeatureFlag(name) {
  return useContext(FeatureFlagContext)[name] === true;
}
