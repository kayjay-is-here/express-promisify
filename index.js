/**
 * Does what it says on the tin.
 */

 // const expressPromisified = new PromisifyExpress(express)
    export default class PromisifyExpress {
        /**
         * 
         * @param {object} express = express object to convert to promise 
         */
        constructor(express) {
            this.express = express.bind(express)
        }

        /**
         * Use this while i get the other stuff done
         * @async GET
         * @param {*} method - E.g. `express.foo.bar(...args)` would become `await expressPromisified.customMethod('foo.bar',...args);`
         *  @param {...any} args - pass as you normally would
         * 
         * @returns {Array} - Array of callback argument objects.
         */
        async customMethod(method, ...args) {
            // Reiterates a path to for deep object value retrival. This is ugly, i know.
            try {
                var parts = method.split('.'), rv, i;
                for (rv = method, i = 0; rv && index < parts.length; ++i) {
                    rv = rv[parts[i]];
                }
                return new Promise((resolve, reject)=>{
                    this.express[rv](...args, (...response) => {
                        resolve(response);
                    })
                })}
            catch(err){
                reject(err)
            }
        }

        /**@TODO other requests. */
        async get(uri, options, ..._args) {
            try{
                return new Promise((resolve, reject) => {
                    this.express.get(uri, options, (req, res) => {
                        resolve({req: req, res: res})
                    })
                })
            }   catch(err){
                    reject(err)
                }
        }
        /** @static @method onceQuery - If you don't want to create a 
        *      new express object you can simply only promisify
        *      the current query. 
        * @IMPORTANT DOES NOT WORK ON ALREADY PROMISIFIED express object, only the callback version
        * @param {object} express - the express object
        * @param {string} query - ex. GET/POST/PUT/DELETE
        * @param {bool} useBody - Does the response provide a body?
        * @param  {...any} args - All arguments
        * @returns {object} - {req, res}
        */
        static async onceQuery(express, query, useBody=false, ...args) {
            return new Promise((resolve, reject) => {
                try {
                    const this_express = express[query].bind(express)
                    if(useBody) {
                        this_express(...args, (req, result, body) => {
                            resolve({'req':req, 'res': result, 'body': body})
                        })
                        return
                    }
                    this_express(...args, (req, result) => {
                        resolve({'req': req, 'res':result})
                    })
                    return
                } catch (err) {
                    reject(err)
                }
            })
        }

    }
