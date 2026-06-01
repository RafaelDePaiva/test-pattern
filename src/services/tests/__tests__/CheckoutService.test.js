import { CheckoutService } from '../../CheckoutService.js';
import { CarrinhoBuilder } from '../builders/CarrinhoBuilder.js';
import { UserMother } from '../builders/UserMother.js';
import { Item } from '../../../domain/Item.js';

describe('CheckoutService', () => {
    describe('quando o pagamento falha', () => {
        it('deve retornar null', async () => {
            const carrinho = new CarrinhoBuilder().build();
            const gatewayStub = { cobrar: jest.fn().mockResolvedValue({ success: false }) };
            const repositoryDummy = { salvar: jest.fn() };
            const emailDummy = { enviarEmail: jest.fn() };
            const checkoutService = new CheckoutService(gatewayStub, repositoryDummy, emailDummy);

            const pedido = await checkoutService.processarPedido(carrinho, '4111111111111111');

            expect(pedido).toBeNull();
            expect(gatewayStub.cobrar).toHaveBeenCalledTimes(1);
            expect(repositoryDummy.salvar).not.toHaveBeenCalled();
            expect(emailDummy.enviarEmail).not.toHaveBeenCalled();
        });
    });

    describe('quando um cliente Premium finaliza a compra', () => {
        it('deve cobrar com desconto e enviar e-mail', async () => {
            const usuarioPremium = UserMother.umUsuarioPremium();
            const itens = [new Item('Item Premium', 200)];
            const carrinho = new CarrinhoBuilder().comUser(usuarioPremium).comItens(itens).build();

            const gatewayStub = { cobrar: jest.fn().mockResolvedValue({ success: true }) };
            const pedidoSalvo = { id: 'pedido-123', carrinho, totalFinal: 180, status: 'PROCESSADO' };
            const repositoryStub = { salvar: jest.fn().mockResolvedValue(pedidoSalvo) };
            const emailMock = { enviarEmail: jest.fn().mockResolvedValue(true) };

            const checkoutService = new CheckoutService(gatewayStub, repositoryStub, emailMock);

            const pedido = await checkoutService.processarPedido(carrinho, '4111111111111111');

            expect(pedido).toBe(pedidoSalvo);
            expect(gatewayStub.cobrar).toHaveBeenCalledWith(180, '4111111111111111');
            expect(emailMock.enviarEmail).toHaveBeenCalledTimes(1);
            expect(emailMock.enviarEmail).toHaveBeenCalledWith(
                'premium@email.com',
                'Seu Pedido foi Aprovado!',
                expect.stringContaining('pedido-123')
            );
        });
    });
});
