import React, { useState, useContext, useEffect } from 'react';
import { ViewportProps } from 'react-map-gl';
import { ServiceContext, ViewContainer } from '@daniel.neuweiler/react-lib-module';

import { IOpenSkyAPIService } from './../services';
import { IStateVectorData, IAircraftTrack, IMapGeoBounds } from './../opensky';
import FlightMap from './../components/FlightMap';

interface ILocalProps {
}
type Props = ILocalProps;

const MapView: React.FC<Props> = (props) => {

  // States
  const [stateVectors, setStateVectors] = useState<IStateVectorData>({ time: Date.now(), states: [] });
  const [trackedAircraft, setTrackedAircraft] = useState<IAircraftTrack | undefined>(undefined);

  // Contexts
  const serviceContext = useContext(ServiceContext)
  const openSkyAPIService = serviceContext.getService<IOpenSkyAPIService>('OpenSkyAPIService');

  // Effects
  useEffect(() => {

    // Mount
    if (openSkyAPIService) {

      openSkyAPIService.onStateVectorsUpdated('MapPage', handleStateVectorsUpdated);
      openSkyAPIService.onAircraftTrackUpdated('MapPage', handleAircraftTrackUpdated);
    }

    // Unmount
    return () => {

      if (openSkyAPIService) {

        openSkyAPIService.offStateVectorsUpdated('MapPage', handleStateVectorsUpdated);
        openSkyAPIService.offAircraftTrackUpdated('MapPage', handleAircraftTrackUpdated);
      }
    }
  }, []);

  const handleStateVectorsUpdated = (data: IStateVectorData) => {

    setStateVectors(data);
  };

  const handleAircraftTrackUpdated = (data: IAircraftTrack) => {

    setTrackedAircraft(data);
  };

  const handleMapChange = (viewState: ViewportProps, geoBounds: IMapGeoBounds) => {

    if (openSkyAPIService)
      openSkyAPIService.geoBounds = geoBounds;
  };

  const handleTrackAircraft = (icao24: string) => {

    if (openSkyAPIService)
      openSkyAPIService.trackAircraft(icao24);

    setTrackedAircraft(undefined);
  };

  const handleReleaseTrack = (icao24: string) => {

    if (openSkyAPIService)
      openSkyAPIService.releaseTrack(icao24);

    setTrackedAircraft(undefined);
  };

  return (

    <ViewContainer
      isScrollLocked={true}>

      <FlightMap
        stateVectors={stateVectors}
        selectedAircraft={trackedAircraft}
        onMapChange={handleMapChange}
        onTrackAircraft={handleTrackAircraft}
        onReleaseTrack={handleReleaseTrack} />
    </ViewContainer>
  );
}

export default MapView;
