import Factory from '@ioc:Adonis/Lucid/Factory'
import Player from 'App/Models/Player';
import { DungeonFactory } from './dungeon';
import { UserFactory } from './user';

export const PlayerFactory = Factory.define(Player, ({}) => {
    return {
        
    }
})
    .relation('dungeon', () => DungeonFactory)
    .relation('user', () => UserFactory)
    .build()