import * as express from 'express';
import * as database from '../database';
import * as config from "../config.json";
import * as expressJwt from 'express-jwt'
import {fromHeaderOrQuerystring} from "../jwt-utilty";
import {genSalt, hash} from "bcryptjs";

module Route {
    export class ProviderController {
        get routes(): express.Router {
            const router = express.Router();
            router.get('/:providerName/products', this.getProviderProducts.bind(this.getProviderProducts));
            router.get('/:id', this.getProviderWithId.bind(this.getProviderWithId));
            router.get('', expressJwt({
                secret: config.jwtSecret,
                getToken: fromHeaderOrQuerystring
            }), this.getAllProviders.bind(this.getAllProviders));
            router.post('/', this.createNewProvider.bind(this.createNewProvider));
            router.delete('/:idProvider', this.removeProvider.bind(this.removeProvider));
            router.put('/:idProvider', this.modifyProvider.bind(this.modifyProvider));
            return router;
        }

        private getAllProviders(req: express.Request | any, res: express.Response) {
            database.connection.query('select idProvider as id, company_name as companyName, creation_date as creationDate, person_name as personName, email, phone_number as phoneNumber\n' +
                'from provider', (err, result: Array<any>) => {

                res.status(200).send(result);
            });
        }

        private getProviderWithId(req: express.Request, res: express.Response) {
            database.connection.query('SELECT idProvider as id, company_name as companyName, creation_date as creationDate, person_name as personName, email, phone_number as phoneNumber\n' +
                'from provider where idProvider = ?', [req.params.id], (err, result: Array<any>) => {
                if (err || result.length !== 1) {
                    res.status(404);
                    res.send();
                    return;
                }
                res.status(200);
                res.send(result[0]);
            });

        }

        /**
         * Crea un nuevo proveedor
         * @param req petición del servidor al cliente
         * @param res respuesta del servidor al cliente
         */
        private createNewProvider(req: express.Request, res: express.Response) {
            const body = req.body;
            if (!body.company || !body.name || !body.email || !body.phoneNumber) {
                res.status(400);
                res.send();
                return;
            }
            database.connection.query(`INSERT INTO provider
            (company_name, creation_date, person_name, email, phone_number) 
                        VALUES (?, NOW(), ?, ?, ?)`, [
                            body.company,
                            body.name,
                            body.email,
                            body.phoneNumber], (err, result) => {
                            if (err) {
                                res.status(400);
                                res.send();
                                return;
                            }
                            res.status(200);
                            res.send({});
                            return;
                        });
        }

        private removeProvider(req: express.Request, res: express.Response) {
            database.connection.query('DELETE FROM provider where idProvider = ?', [Number(req.params.idProvider)], (err, result) => {
               res.status(err ? 400 : 200);
               res.send({});
            });
        }

        private modifyProvider(req: express.Request, res: express.Response) {
            database.connection.query('SELECT * from provider where idProvider = ?', [req.params.idProvider], (err, result) => {
                if (err) {
                    res.status(400);
                    res.send({});
                    return;
                }
                const body = req.body;
                const currentInfo = result[0];
                const company = body.companyName ? body.companyName : currentInfo.company_name;
                const name = body.personName ? body.personName : currentInfo.person_name;
                const email = body.email ? body.email : currentInfo.email;
                const phoneNumber = body.phoneNumber ? body.phoneNumber : currentInfo.phone_number;

                database.connection.query('UPDATE `provider` SET ' +
                    'company_name = ?, ' +
                    'person_name = ?, ' +
                    'email = ?, ' +
                    'phone_number = ? ' +
                    'WHERE idProvider = ?', [company, name, email, phoneNumber, req.params.idProvider], (err, r) => {
                    if(err)
                    {
                        res.status(400);
                        res.send();
                        return;
                    }
                    res.status(200);
                    res.send({});
                });
                const selectedProducts = req.body.selectedProducts as Array<any>;
                let productsToDelete = req.body.productsToDelete as Array<any>;
                productsToDelete = productsToDelete.filter(value => !selectedProducts.find(value1 => value1.idProduct === value.idProduct));
                selectedProducts.forEach(value => {
                    database.connection.query(`insert into have_product (idProvider, idProduct, price)
values (?, ?, ?)`, [req.params.idProvider, value.idProduct, value.price], err1 => {console.error(err1)});
                });

                productsToDelete.forEach(value => {
                    database.connection.query(`delete from have_product where idProvider = ? and idProduct = ?`,
                        [req.params.idProvider, value.idProduct], err1 => {console.error(err1)});
                });
            })
        }

        private getProviderProducts(req: express.Request, res: express.Response) {
            database.connection.query(`select products.idProduct, products.mercadolibre_id as meliId, products.name, products.stock, hp.price
from products inner join have_product hp on products.idProduct = hp.idProduct
inner join provider p on hp.idProvider = p.idProvider where p.company_name = ?`, [req.params.providerName], (err, results) => {
                if (err) {
                    res.status(400).send({});
                    return;
                }
                res.status(200).send(results);
            });
        }

        private setProviderProducts(req: express.Request, res: express.Response) {

        }
    }
}

export = Route;
