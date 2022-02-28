import Factory from '@ioc:Adonis/Lucid/Factory'
import DungeonRequest from 'App/Models/DungeonRequest';
import { DungeonFactory } from './dungeon';
import { UserFactory } from './user';

export const DungeonRequestFactory = Factory.define(DungeonRequest, ({}) => {
    return {
        status: 'pending'
    }
})
    .relation('dungeon', () => DungeonFactory)
    .relation('user', () => UserFactory)
    .state('accepted', (dungeon) => dungeon.status = 'accepted')
    .state('rejected', (dungeon) => dungeon.status = 'rejected')
    .build()
