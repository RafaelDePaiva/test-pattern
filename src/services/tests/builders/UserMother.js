import { User } from '../../../domain/User.js';

export class UserMother {
    static umUsuarioPadrao() {
        return new User(
            'user-1',
            'Usuário Padrão',
            'usuario@padrao.com',
            'PADRAO'
        );
    }

    static umUsuarioPremium() {
        return new User(
            'user-2',
            'Usuário Premium',
            'premium@email.com',
            'PREMIUM'
        );
    }
}
