import { db } from './firestore'
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { Station } from '../../types/stations'

export const getStationById = async (id: string) => {
  const station = (
    await db.collection('stations').doc(id).withConverter<Station>(stationConverter).get()
  ).data()
  return station as Station | undefined
}

const stationConverter = {
  toFirestore(station: Station): DocumentData {
    return {
      id: station.id,
      name: station.name,
      createdAt: station.createdAt,
    }
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Station {
    const data = snapshot.data()!
    return {
      id: data.id,
      name: data.name,
      createdAt: data.createdAt.toDate(),
    }
  },
}
