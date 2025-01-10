import React, { Component } from 'react'

export default class Footer extends Component {
  render() {
    return (
    <>
        {/* Footer */}
        <footer className="bg-white py-5">
                <div className="container mx-auto text-center">
                    <p className="text-sm">Privacy Policy | Terms of Service</p>
                    <div className="mt-2">
                        <span className="mx-2">Facebook</span>
                        <span className="mx-2">Twitter</span>
                        <span className="mx-2">LinkedIn</span>
                    </div>
                </div>
            </footer>
    </>
    )
  }
}
